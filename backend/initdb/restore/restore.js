const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { exec } = require("child_process");
const path = require('path');
const fs= require("fs");

process.env.PATH = `${process.env.PATH}:/usr/lib/postgresql/16/bin`;
// process.env.PATH = `${process.env.PATH}:/Library/PostgreSQL/16/bin`;

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

function checkPostgresDatabaseExists() {
    return new Promise((resolve, reject) => {
        const checkDbCommand = `PGPASSWORD=${process.env.POSTGRES_PASSWORD} psql -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -U ${process.env.POSTGRES_USER} -lqt | cut -d \\| -f 1 | grep -qw ${process.env.POSTGRES_NAME}`;
        exec(checkDbCommand, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Ошибка при проверке существования базы данных: ${stderr}`));
            } else {
                resolve(true);
            }
        });
    });
}

function createPostgresDatabase() {
    return new Promise((resolve, reject) => {
        const createDbCommand = `PGPASSWORD=${process.env.POSTGRES_PASSWORD} createdb -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -U ${process.env.POSTGRES_USER} ${process.env.POSTGRES_NAME}`;
        exec(createDbCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при создании базы данных: ${stderr}`);
                reject(new Error(`Ошибка при создании базы данных: ${stderr}`));
            } else {
                console.log("База данных успешно создана.");
                resolve();
            }
        });
    });
}

async function checkAndCreatePostgresDatabase() {
    try {
        const exists = await checkPostgresDatabaseExists();
        if (!exists) {
            await createPostgresDatabase();
        } else {
            console.log("База данных уже существует.");
        }
    }catch (error) {
        if (error.message.includes('Ошибка при проверке существования базы данных')) {
            await createPostgresDatabase();
        } else {
            throw error;
        }
    }
}


function downloadPostgresBackup() {
    const downloadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: process.env.BACKUP_POSTGRES,
    };

    return new Promise((resolve, reject) => {
        const getObjectCommand = new GetObjectCommand(downloadParams);
        const downloadFile = fs.createWriteStream(process.env.BACKUP_POSTGRES);
        s3Client.send(getObjectCommand)
            .then(data => {
                data.Body.pipe(downloadFile);
                downloadFile.on('finish', () => {
                    console.log("Файл успешно загружен из S3.");
                    resolve();
                });
                downloadFile.on('error', err => {
                    console.error("Ошибка при записи файла из S3:", err);
                    reject(new Error(`Ошибка при записи файла из S3: ${err.message}`));
                });
            })
            .catch(err => {
                console.error("Ошибка при загрузке файла из S3:", err);
                reject(new Error(`Ошибка при загрузке файла из S3: ${err.message}`));
            });
    });
}

function restorePostgresDatabase() {
    const pgRestoreCommand = `PGPASSWORD=${ process.env.POSTGRES_PASSWORD} pg_restore -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -U ${process.env.POSTGRES_USER} -d ${process.env.POSTGRES_NAME} ${process.env.BACKUP_POSTGRES}`;
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

async function downloadMongoBackup() {
    return new Promise((resolve, reject) => {
        const backupDir = path.join(__dirname, 'backup');
        const archivePath = path.join(backupDir, `${process.env.MONGO_NAME}.tar.gz`);
        const downloadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${process.env.MONGO_NAME}.tar.gz`,
        };

        if (!fs.existsSync(backupDir)){
            fs.mkdirSync(backupDir);
        }

        const fileStream = fs.createWriteStream(archivePath);
        const getObjectCommand = new GetObjectCommand(downloadParams);

        s3Client.send(getObjectCommand)
            .then(data => {
                data.Body.pipe(fileStream);
                fileStream.on('finish', () => {
                    console.log("Файл успешно загружен из S3.");
                    resolve(archivePath);
                });
                fileStream.on('error', err => {
                    console.error("Ошибка при записи файла из S3:", err);
                    reject(new Error(`Ошибка при проверке существования базы данных: ${err}`));
                });
            })
            .catch(err => {
                console.error("Ошибка при загрузке файла из S3:", err);
                reject(new Error(`Ошибка при проверке существования базы данных: ${err}`));
            });
    });
}

function extractMongoBackup(archivePath) {
    return new Promise((resolve, reject) => {
        const extractCommand = `tar -xzvf ${archivePath} -C ${path.dirname(archivePath)}`;
        exec(extractCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при распаковке архива: ${stderr}`);
                reject(new Error(`Ошибка при проверке существования базы данных: ${stderr}`));
            } else {
                console.log(`Архив успешно распакован: ${archivePath}`);
                resolve(path.dirname(archivePath));
            }
        });
    });
}

function restoreMongoDB(backupDir) {
    return new Promise((resolve, reject) => {
        const restoreCommand = `mongorestore --host ${process.env.MONGO_HOST} --port ${process.env.MONGO_PORT} --db ${process.env.MONGO_NAME} ${path.join(backupDir, process.env.MONGO_NAME)}`;
        exec(restoreCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при восстановлении базы данных MongoDB: ${stderr}`);
                reject(new Error(`Ошибка при проверке существования базы данных: ${stderr}`));
            } else {
                console.log("База данных MongoDB успешно восстановлена.");
                resolve();
            }
        });
    });
}

async function RestoreMongo() {
    try {
        const archivePath = await downloadMongoBackup();
        const backupDir = await extractMongoBackup(archivePath);
        await restoreMongoDB(backupDir);
        fs.unlinkSync(archivePath);
        console.log("Архив резервной копии удален.");
    } catch (err) {
        console.error("Произошла ошибка при восстановлении базы данных:", err);
    }
}


async function RestorePostgres() {
    try {
        await checkAndCreatePostgresDatabase();
        await downloadPostgresBackup();
        await restorePostgresDatabase();
        fs.unlinkSync(process.env.BACKUP_POSTGRES);
        console.log("Файл резервной копии удален.");
    } catch (err) {
        console.error("Произошла ошибка:", err);
    }
}

module.exports = {
    RestorePostgres,
    RestoreMongo
};