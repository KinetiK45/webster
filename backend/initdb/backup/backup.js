const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

process.env.PATH = `${process.env.PATH}:/usr/lib/postgresql/16/bin`;
process.env.PATH = `${process.env.PATH}:/usr/local/bin`;
const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'BUCKET_NAME',
    'POSTGRES_PASSWORD', 'POSTGRES_HOST', 'POSTGRES_PORT',
    'POSTGRES_USER', 'POSTGRES_NAME', 'BACKUP_POSTGRES',
    'MONGO_HOST', 'MONGO_PORT', 'MONGO_NAME'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Ошибка: Переменная окружения ${varName} не установлена.`);
        process.exit(1);
    }
});

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

const pgDumpCommand =  `PGPASSWORD=${process.env.POSTGRES_PASSWORD} pg_dump -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -U ${process.env.POSTGRES_USER} -F c -b -v -f ${process.env.BACKUP_POSTGRES} ${process.env.POSTGRES_NAME}`;
exec(pgDumpCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`Ошибка при создании резервной копии базы данных: ${stderr}`);
        process.exit(1);
    } else {
        console.log("Резервная копия создана успешно.");
        const fileStream = fs.createReadStream(path.join(__dirname, process.env.BACKUP_POSTGRES));
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: process.env.BACKUP_POSTGRES,
            Body: fileStream
        };

        s3Client.send(new PutObjectCommand(uploadParams))
            .then(data => {
                console.log("Файл успешно отправлен на S3.", data);
                fs.unlinkSync(process.env.BACKUP_POSTGRES);
                console.log("Локальная копия резервной копии удалена.");
            })
            .catch(err => {
                console.error("Ошибка при отправке файла на S3:", err);
            });
    }
});

const backupDir = path.join(__dirname, 'backup');
const backupDbDir = path.join(backupDir, process.env.MONGO_NAME);
const archivePath = path.join(backupDir, `${process.env.MONGO_NAME}.tar.gz`);

const backupCommand = `mongodump --host ${process.env.MONGO_HOST} --port ${process.env.MONGO_PORT} --db ${process.env.MONGO_NAME} --out ${backupDir}`;
const tarCommand = `tar -czf ${archivePath} -C ${backupDir} ${process.env.MONGO_NAME}`;

exec(backupCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`Ошибка при создании резервной копии MongoDB: ${stderr}`);
        process.exit(1);
    } else {
        console.log(`Резервная копия MongoDB успешно создана в ${backupDbDir}`);

        exec(tarCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при создании архива резервной копии: ${stderr}`);
                process.exit(1);
            } else {
                console.log(`Архив резервной копии успешно создан: ${archivePath}`);

                const fileStream = fs.createReadStream(archivePath);
                const uploadParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: path.basename(archivePath),
                    Body: fileStream
                };

                s3Client.send(new PutObjectCommand(uploadParams))
                    .then(data => {
                        console.log("Файл успешно отправлен на S3.", data);
                        fs.unlinkSync(archivePath);
                        console.log("Локальная копия архива резервной копии удалена.");
                    })
                    .catch(err => {
                        console.error("Ошибка при отправке файла на S3:", err);
                    });
            }
        });
    }
});