const userService = require('../service/userService');

async function getUser(req, res) {
    const { user_id } = req.params;
    try {
        const currentUserId = req.senderData?.id;
        const requestedId = user_id === 'me' ? user_id : parseInt(user_id, 10);
        const userResult = await userService.getById(requestedId, currentUserId);
        if (!userResult.isMatch) {
            return res.status(404).json({ state: false, message: userResult.message });
        }
        res.status(200).json({ state: true, message: "User found", data: userResult.user });
    } catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function updateUser(req,res){
    const { password, new_password, email, full_name } = req.body;
    try {
        const result = await userService.updateUserById(req.senderData.id, password, new_password, email, full_name);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }

        res.status(200).json({ state: true, message: "Successfully updated", data: result.user.id });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function userAvatarUpload(req,res) {
    try {
        if (!req.files.file) {
            return res.json({ state: false, message: 'Error loading file'});
        }
        const result = await userService.uploadImage(req.files.file, req.senderData.id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Avatar successfully updated" });
    }catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function userAvatar(req,res) {
    const {user_id} = req.params;
    try {
        const result = await userService.getImage(user_id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        const photoContent = result.photo;

        if (Buffer.isBuffer(photoContent)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(photoContent);
        } else if (photoContent.pipe) {
            res.setHeader('Content-Type', 'image/jpeg');
            photoContent.pipe(res);
        }
    }catch (error) {
        console.error('Error in userAvatar:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function userAllAvatars(req,res) {
    try {
        const result = await userService.getImages(req.senderData.id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Avatar successfully updated" });
    }catch (error) {
        console.error('Error in userAvatar:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}
module.exports = {
    getUser,
    updateUser,
    userAvatarUpload,
    userAvatar,
    userAllAvatars
}