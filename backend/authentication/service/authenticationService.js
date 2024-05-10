const bcrypt = require("bcrypt");
const myDataSourcePromise = require("../config/ormSource");
const { Users } = require("../model/users");
const client = require("../config/redisSource");
const getAsync = (client.get).bind(client);
let userRepository;
(async () => {
    try {
        const myDataSource = await myDataSourcePromise;
        userRepository = myDataSource.getRepository(Users);
        console.log("userRepository initialized");
    } catch (error) {
        console.error("Error initializing userRepository:", error);
        throw error;
    }
})();

async function registerUser({ username, password, email, full_name }) {
    try {
        let salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await userRepository.create({
            username,
            password: hashedPassword,
            email,
            full_name,
        });
        await userRepository.save(newUser);
        return newUser;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

async function authenticateUser(username, password) {
    try {
        const user = await userRepository.findOne({ where: { username } });
        if (!user) {
            return { isMatch: false, message: 'User not found' };
        }
        const isMatch = await bcrypt.compare(password, user.password);
        return {
            isMatch,
            message: isMatch ? 'Authentication successful' : 'Incorrect password',
            ...(isMatch && { user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name } }),
        };
    } catch (error) {
        console.error('Error authenticate user:', error);
        throw error;
    }
}

async function getUserByEmail(email){
    try {
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return { isMatch: false, message: 'Wrong email',  user: null };
        }
        return {
            isMatch: true,
            message: 'Found successful',
            user: { id: user.id, full_name: user.full_name }
        };
    }catch (error) {
        console.error('Error find user:', error);
        throw error;
    }
}

async function saveResetPasswordCode(user_id, code) {
    try {
        const key = `reset:${code}`;
        const expirationTime = 1500;
        await client.set(key, user_id, 'EX', expirationTime);
    }catch (error) {
        console.error('Error save reset password code:', error);
        throw error;
    }
}

async function resetPassword(code, newPassword) {
    try {
        const user_id = await getAsync(`reset:${code}`);
        if (!user_id) {
            return { state: false, message: 'Invalid or expired reset code'};
        }
        const user = await userRepository.findOne({ where: { id: Number.parseInt(user_id) } });
        if (!user) {
            return { state: false, message: 'User not found' };
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await userRepository.save(user);
        await client.del(`reset:${code}`);
        return { state: true, message: 'Password reset successful' };
    } catch (error) {
        console.error('Error resetting password:', error);
        return { state: false, message: error.message };
    }
}

async function saveTwoFactorCode(user_id,code ) {
    try {
        const key = `2fa:${code}`;
        const expirationTime = 300;
        const value = JSON.stringify({ user_id, code });
        await client.set(key, value, 'EX', expirationTime);
    } catch (error) {
        throw error;
    }
}


function generateCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
}

module.exports = {
    registerUser,
    authenticateUser,
    getUserByEmail,
    saveResetPasswordCode,
    saveTwoFactorCode,
    generateCode,
    resetPassword
}
