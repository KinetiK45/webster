const { registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFonts() {
    const fontDir = path.join(__dirname, 'fonts');

    await fs.promises.mkdir(fontDir, { recursive: true });

    const fontUrls = [
        'https://fonts.gstatic.com/s/pacifico/v17/FwZY7-Qmy14u9lezJ96A.ttf',
        'https://globalfonts.pro/global_files/5c893b3f7dd5820465940531/files/Quicksand-Light.ttf',
        'https://globalfonts.pro/global_files/616835ff4110227f48e22097/files/TimesNewRomanMTStd.ttf'
    ];

    // Download each font
    await Promise.all(fontUrls.map(async (url) => {
        const fontName = path.basename(url);
        const fontPath = path.join(fontDir, fontName);

        const file = fs.createWriteStream(fontPath);
        const response = await new Promise((resolve, reject) => {
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => resolve(response));
            }).on('error', (err) => {
                fs.unlink(fontPath, () => reject(err));
            });
        });

        console.log(`Font downloaded to: ${fontPath}`);
    }));

    console.log('Fonts downloaded');
}

async function registerFonts() {
    await downloadFonts();

    const fontDir = path.join(__dirname, 'fonts');
    const fontFiles = fs.readdirSync(fontDir);
    fontFiles.forEach(fontFile => {
        const fontPath = path.join(fontDir, fontFile);
        const fontFamily = path.basename(fontPath, path.extname(fontPath));

        try {
            registerFont(fontPath, { family: fontFamily });
            console.log('Font registered:', fontFamily);
        } catch (error) {
            console.error('Error registering font:', error);
            console.error('Font file:', fontPath);
        }
    });

    console.log('Fonts registered');
}

module.exports = {
    registerFonts
};
