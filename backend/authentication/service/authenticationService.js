const redis = require("redis");
const bcrypt = require("bcrypt");
const myDataSourcePromise = require("../config/dataSource");
const { Users } = require("../model/users");
let userRepository;
(async () => {
    try {
        const myDataSource = await myDataSourcePromise; // Ждем, пока DataSource будет инициализирован
        userRepository = myDataSource.getRepository(Users); // Теперь инициализируем userRepository
        console.log("userRepository initialized");
    } catch (error) {
        console.error("Error initializing userRepository:", error);
        throw error; // Остановить выполнение, если инициализация не удалась
    }
})();
const client = redis.createClient();

async function registerUser({ username, password, email, full_name }) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
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
        await client.setex(key, expirationTime, user_id);
    }catch (error) {
        console.error('Error save reset password code:', error);
        throw error;
    }
}

async function getResetPasswordCode(code) {
    const key = `reset:${code}`;
    return new Promise((resolve, reject) => {
        client.get(key, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

async function resetPassword(code, newPassword) {
    try {
        const user_id = await getResetPasswordCode(code);
        if (!user_id) {
            return { state: false, message: 'Invalid or expired reset code'};
        }
        const user = await userRepository.findOne({ where: { id: user_id } });
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

async function saveTwoFactorCode(user_id, code) {
    try {
        const key = `2fa:${user_id}`;
        const expirationTime = 300;
        await client.setex(key, expirationTime, code);
    }catch (error) {
        console.error('Error save two factor code:', error);
        throw error;
    }
}

async function getTwoFactorCode(user_id) {
    const key = `2fa:${user_id}`;
    return new Promise((resolve, reject) => {
        client.get(key, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

function generateCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < bytes.length; i++) {
        const randomIndex = bytes[i] % characters.length;
        result += characters[randomIndex];
    }
    return result;
}

module.exports = {
    registerUser,
    authenticateUser,
    getUserByEmail,
    saveResetPasswordCode,
    saveTwoFactorCode,
    generateCode,
    getTwoFactorCode,
    client,
    resetPassword
}
