const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { exec } = require("child_process");
const fs = require("fs");

process.env.PATH = `${process.env.PATH}:/usr/lib/postgresql/16/bin`;
// process.env.PATH = `${process.env.PATH}:/Library/PostgreSQL/16/bin`;

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

function checkDatabaseExists() {
    return new Promise((resolve, reject) => {
        const checkDbCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -lqt | cut -d \\| -f 1 | grep -qw ${process.env.DB_NAME}`;
        exec(checkDbCommand, (error, stdout, stderr) => {
            if (error) {
                // База данных не существует
                resolve(false);
            } else {
                // База данных существует
                resolve(true);
            }
        });
    });
}

function createDatabase() {
    return new Promise((resolve, reject) => {
        const createDbCommand = `PGPASSWORD=${process.env.DB_PASSWORD} createdb -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} ${process.env.DB_NAME}`;
        exec(createDbCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при создании базы данных: ${stderr}`);
                reject(error);
            } else {
                console.log("База данных успешно создана.");
                resolve();
            }
        });
    });
}

async function checkAndCreateDatabase() {
    const exists = await checkDatabaseExists();
    if (!exists) {
        await createDatabase();
    } else {
        console.log("База данных уже существует.");
    }
}


function downloadBackup() {
    const downloadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: process.env.BACKUP_FILE,
    };

    return new Promise((resolve, reject) => {
        const getObjectCommand = new GetObjectCommand(downloadParams);
        const downloadFile = fs.createWriteStream(process.env.BACKUP_FILE);
        s3Client.send(getObjectCommand)
            .then(data => {
                data.Body.pipe(downloadFile);
                downloadFile.on('finish', () => {
                    console.log("Файл успешно загружен из S3.");
                    resolve();
                });
                downloadFile.on('error', err => {
                    console.error("Ошибка при записи файла из S3:", err);
                    reject(err);
                });
            })
            .catch(err => {
                console.error("Ошибка при загрузке файла из S3:", err);
                reject(err);
            });
    });
}

function restoreDatabase() {
    const pgRestoreCommand = `PGPASSWORD=${ process.env.DB_PASSWORD} pg_restore -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} ${process.env.BACKUP_FILE}`;
    return new Promise((resolve, reject) => {
        exec(pgRestoreCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при восстановлении базы данных: ${stderr}`);
                reject(error);
            } else {
                console.log("База данных восстановлена успешно.");
                resolve();
            }
        });
    });
}

async function Restore() {
    try {
        await checkAndCreateDatabase();
        await downloadBackup();
        await restoreDatabase();
        fs.unlinkSync(process.env.BACKUP_FILE);
        console.log("Файл резервной копии удален.");
    } catch (err) {
        console.error("Произошла ошибка:", err);
    }
}

module.exports = {
    Restore
};