const myDataSourcePromise = require("../config/ormSource");
const {Users} = require("../model/users");
const {Photos} = require("../model/photos");
const bcrypt = require("bcrypt");
const {sendToS3PutCommand, sendToS3GetCommand} = require("../config/s3Client");
const getFileExtension = require("../helpers/FileExtension");
const generateCode = require("../helpers/GenerateCode");
let userRepository;
let photoRepository;
(async () => {
    try {
        const myDataSource = await myDataSourcePromise;
        userRepository = myDataSource.getRepository(Users);
        photoRepository = myDataSource.getRepository(Photos);
    } catch (error) {
        console.error("Error initializing userRepository:", error);
        throw error;
    }
})();

async function getById(requestedId, currentUserId) {
    try {
        if (requestedId === undefined) {
            return {status: 400, isMatch: false, message: "Not your profile"};
        }
        const user = await userRepository.findOne({where: {id: requestedId}});
        const lastPhoto = await photoRepository.findOne({
            where: {user: {id: requestedId}},
            order: {created_at: 'DESC'},
        });
        const isMatch = Boolean(user);
        return {
            isMatch,
            message: isMatch ? 'User found' : 'User not found',
            ...(isMatch && {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    ...(requestedId === currentUserId
                            ? {username: user.username, email: user.email}
                            : {}
                    ),
                    avatar: lastPhoto
                        ? `https://ucodewebster.s3.amazonaws.com/${lastPhoto.url}`
                        : `https://ucodewebster.s3.amazonaws.com/img.png`
                },
            }),
        };
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw new Error('Internal server error');
    }
}


async function updateUserById(id, password, new_password, email, full_name) {
    try {
        if (id === undefined) {
            return {status: 401, isMatch: false, message: "Authorization required"};
        }
        const user = await userRepository.findOne({where: {id: Number.parseInt(id)}});
        if (!user) {
            return {status: 404, isMatch: false, message: "User not found"};
        }
        const updates = {};
        if (password && new_password) {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return {status: 404, isMatch: false, message: "Incorrect current password"};
            }
            updates.password = await bcrypt.hash(new_password, 10);
        }
        if (email) {
            updates.email = email;
        }
        if (full_name) {
            updates.full_name = full_name;
        }
        const hasUpdates = Object.keys(updates).length > 0;
        return {
            isMatch: hasUpdates,
            message: hasUpdates ? "User updated successfully" : "No changes to update",
            ...(hasUpdates && {
                user: {
                    id: user.id,
                    ...(email && {email}),
                    ...(full_name && {full_name}),
                },
            }),
        };
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw Error;
    }
}

async function getByFullName(value){
    try {
        const query = userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.photos', 'photos')
            .andWhere('LOWER(user.full_name) LIKE :value', { value: `%${value.toLowerCase()}%` });
        const users = await query.getMany();
        if (!users.length) {
            return { status: 200, isMatch: true, message: "User with this name don't found", users: [] };
        }
        const usersWithUrl = users.map(user => {
            const photoUrl = user && user.photos ? user.photos.url : null;
            const avatarLink = photoUrl ? `https://ucodewebster.s3.amazonaws.com/${photoUrl}` : `https://ucodewebster.s3.amazonaws.com/img.png`;
            return {
                id: user.id,
                full_name: user.full_name,
                avatar: avatarLink
            }
        });
        return { isMatch: true, users: usersWithUrl };
    } catch (error) {
        throw error;
    }
}

async function uploadImage(file, user_id) {
    try {
        if (user_id === undefined) {
            return {status: 401, isMatch: false, message: "Authorization required"};
        }
        const user = await userRepository.findOne({where: {id: user_id}});
        if (!user) {
            return {status: 404, isMatch: false, message: "User not found"};
        }

        const contentType = file.mimetype;
        const fileExtension = getFileExtension(contentType);
        const objectKey = `userAvatar/${generateCode(12)}${fileExtension}`;
        const fileContent = file.data;

        await sendToS3PutCommand(objectKey, fileContent, contentType);
        console.log("File uploaded to S3");

        const newUserAvatar = await photoRepository.create({
            url: objectKey,
            user: user,
        });

        await photoRepository.save(newUserAvatar);
        return {isMatch: true, message: "Avatar uploaded successfully", avatar: newUserAvatar};
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return {status: 500, isMatch: false, message: "Error uploading avatar"};
    }
}

async function getImage(user_id) {
    try {
        if (user_id === undefined) {
            return {status: 400, isMatch: false, message: "User ID is required"};
        }
        const lastPhoto = await photoRepository.findOne({
            where: {user: {id: user_id}},
            order: {created_at: 'DESC'},
        });
        if (!lastPhoto) {
            return {status: 404, isMatch: false, message: "No photos found for this user"};
        }
        const s3Data = await sendToS3GetCommand(lastPhoto.url);
        return {isMatch: true, message: "Photo retrieved", photo: s3Data.Body};
    } catch (error) {
        console.error("Error getting avatar:", error);
        return {status: 500, isMatch: false, message: "Error getting avatar"};
    }
}

async function getImages(user_id) {
    try {
        if (user_id === undefined) {
            return {status: 400, isMatch: false, message: "User ID is required"};
        }
        const photos = await photoRepository.find({
            where: {userId: user_id},
            order: {created_at: 'DESC'},
        });

        if (photos.length === 0) {
            return {status: 404, isMatch: false, message: "No photos found for this user"};
        }
        const images = [];
        for (const photo of photos) {
            const data = await sendToS3GetCommand(photo.url);
            images.push({id: photo.id, created_at: photo.created_at, content: data.Body});
        }
        return {isMatch: true, message: "Photos retrieved successfully", data: images};
    } catch (error) {
        console.error("Error getting photos from S3:", error);
        return {status: 500, isMatch: false, message: "Error getting photos from S3"};
    }
}

module.exports = {
    getById,
    updateUserById,
    uploadImage,
    getImage,
    getImages,
    getByFullName
}
