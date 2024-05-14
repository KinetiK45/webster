const fileUpload = require('express-fileupload');

const fileUploadMiddleware = fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded',
});

module.exports = fileUploadMiddleware;