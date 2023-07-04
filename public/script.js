window.addEventListener('load', function () {
    const codeReader = new ZXing.BrowserPDF417Reader()
    // const codeReader = new ZXing.BrowserQRCodeReader();
    console.log('ZXing code reader initialized');

    const decodeFun = (e) => {
        const parent = e.target.parentNode;
        const img = parent.getElementsByClassName('img')[0].cloneNode(true);
        const resultEl = parent.getElementsByClassName('result')[0];
        console.log(resultEl)
        codeReader.decodeFromImage(img)
            .then(result => {
                console.log(result);
                resultEl.textContent = result.text;
            })
            .catch(err => {
                console.error(err);
                resultEl.textContent = err;
            });

        console.log(`Started decode for image from ${img.src}`)
    };

    for (const element of document.getElementsByClassName('decodeButton')) {
        element.addEventListener('click', decodeFun, false);
    }

})
