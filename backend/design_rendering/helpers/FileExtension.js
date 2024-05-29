function getFileExtension(mimeType) {
    switch (mimeType) {
        case 'image/jpeg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        default:
            throw new Error('Unsupported file type');
    }
}

module.exports = getFileExtension;