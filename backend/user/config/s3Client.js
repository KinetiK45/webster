const { S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


async function sendToS3PutCommand(objectKey, fileContent, contentType) {
    return s3Client.send(new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: objectKey,
        Body: fileContent,
        ContentType: contentType,
    }));
}

async function sendToS3GetCommand(objectKey){
    return s3Client.send((new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: objectKey
    })));
}

module.exports = {
    sendToS3PutCommand,
    sendToS3GetCommand
}