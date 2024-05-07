const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const logoPath = path.resolve(__dirname, "../img.png");
const bucketName = "ucodewebster";
const objectKey = "img.png";

const fileContent = fs.readFileSync(logoPath);

const uploadParams = {
    Bucket: bucketName,
    Key: objectKey,
    Body: fileContent,
    ContentType: "image/png",
};

const uploadCommand = new PutObjectCommand(uploadParams);
async function sendToS3() {
    return s3Client.send(uploadCommand);
}

module.exports = {
    sendToS3
}