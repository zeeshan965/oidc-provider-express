import express from 'express';
import Provider from "oidc-provider";
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import configuration from "./configuration.js";

const jwtSecret = 'your_jwt_secret';
const issuer = 'http://localhost:3700';
const app = express();
const port = 3700;

dotenv.config();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

let server;
try {
    let adapter;
    //if (process.env.MONGODB_URI) {}
    ({default: adapter} = await import('./adapter/sequelize.js'));
    await adapter.connect();
    const provider = new Provider(issuer, {adapter, ...configuration});
    app.use(provider.callback);

    app.get('/login', (req, res) => {
        const authParams = {
            response_type: 'code',
            client_id: 'client1',
            redirect_uri: 'http://localhost:3000/callback',
            scope: 'openid',
            state: 'some_state',
        };

        const authUrl = provider.authorizationUrl(authParams);
        res.redirect(authUrl);
    });

    // Route for handling callback after authentication
    app.get('/callback', async (req, res) => {
        const params = provider.callbackParams(req);

        try {
            const result = await provider.authorizationCallback('http://localhost:3000/callback', params, {mergeWithLastSubmission: true});
            const tokens = await result.grantId.save();

            // Generate an access token and ID token
            const accessToken = jwt.sign({sub: result.accountId}, jwtSecret);
            const idToken = jwt.sign({sub: result.accountId}, jwtSecret);

            // Redirect the user to the desired location
            res.redirect(`/profile?access_token=${accessToken}&id_token=${idToken}`);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // Route for displaying user profile
    app.get('/profile', (req, res) => {
        const {access_token, id_token} = req.query;

        // Verify the access token and ID token
        try {
            const decodedAccessToken = jwt.verify(access_token, jwtSecret);
            const decodedIdToken = jwt.verify(id_token, jwtSecret);

            // Display the user profile
            res.json({
                access_token: decodedAccessToken,
                id_token: decodedIdToken,
            });
        } catch (err) {
            res.status(401).send('Invalid tokens');
        }
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });

} catch (err) {
    if (server?.listening) server.close();
    console.error(err);
    process.exitCode = 1;
}