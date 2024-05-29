const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// process.env.PATH = `${process.env.PATH}:/Library/PostgreSQL/16/bin`;
process.env.PATH = `${process.env.PATH}:/usr/lib/postgresql/16/bin`;

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

const pgDumpCommand =  `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -F c -b -v -f ${process.env.BACKUP_FILE} ${process.env.DB_NAME}`;
exec(pgDumpCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`Ошибка при создании резервной копии базы данных: ${stderr}`);
        process.exit(1);
    } else {
        console.log("Резервная копия создана успешно.");
        const fileStream = fs.createReadStream(path.join(__dirname, process.env.BACKUP_FILE));
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: process.env.BACKUP_FILE,
            Body: fileStream
        };

        s3Client.send(new PutObjectCommand(uploadParams))
            .then(data => {
                console.log("Файл успешно отправлен на S3.", data);
                fs.unlinkSync(process.env.BACKUP_FILE);
                console.log("Локальная копия резервной копии удалена.");
            })
            .catch(err => {
                console.error("Ошибка при отправке файла на S3:", err);
            });
    }
});
