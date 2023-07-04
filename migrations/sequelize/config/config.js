const configs = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        migrationStorageTableName: 'SequelizeMeta',
        debug:process.env.DEBUG
    },
    test: {
        username: '',
        password: '',
        database: '',
        host: '',
        dialect: 'postgres',
    },
    production: {
        username: '',
        password: '',
        database: '',
        host: '',
        dialect: 'postgres',
    },
};

module.exports = configs;