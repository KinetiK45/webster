const autService = require('../service/authenticationService')
const rabbitService = require('../service/rabbitService');
const {generateToken} = require('../controllers/TokenController');
const client = require("../config/redisSource");
const generateCode = require("../helpers/GenerateCode");
const getAsync = (client.get).bind(client);

async function register(req, res) {
    const { username, password, email, full_name } = req.body;
    try {
        const newUser = await autService.registerUser({ username, password, email, full_name });
        await rabbitService.publishUserRegisteredEvent(newUser.id, newUser.email, newUser.full_name);
        res.status(201).json({ state: true, message: 'Registration successful!', data: { id: newUser.id } });
    } catch (error) {
        console.log('Error during registration : ',error);
        res.status(500).json({ state: false, message: 'Registration failed' });
    }
}

async function login(req, res) {
    const { username, password } = req.body;
    try {
        const result = await autService.authenticateUser(username, password);
        if (!result.isMatch) {
            return res.status(404).json({ state: false, message: result.message });
        }
        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
        await autService.saveTwoFactorCode(result.user.id, twoFactorCode);
        await rabbitService.publishUserLoginEvent(twoFactorCode, result.user.id, result.user.full_name , result.user.email)
        return res.status(200).json({
            state: true,
            message: 'Login successful. Please enter the code sent to your email.',
            data: { user_id: result.user.id }
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ state: false, message: 'Internal server error' });
    }
}

async function confirmTwoFactor(req, res) {
    const { confirm } = req.body;
    try {
        const storedValue = await getAsync(`2fa:${confirm}`);
        const { user_id, code } = JSON.parse(storedValue);
        if (Number.parseInt(code) === confirm) {
            res.cookie('auth_token', generateToken({ id: user_id }), { httpOnly: true });
            await client.del(`2fa:${confirm}`);
            return res.status(200).json({ state: true, message: 'Authentication successful' });
        } else {
            return res.status(401).json({ state: false, message: 'Incorrect code' });
        }
    } catch (error) {
        console.error('Error during 2FA confirmation:', error);
        return res.status(500).json({ state: false, message: 'Internal server error' });
    }
}

async function passwordReset(req, res) {
    try {
        const { email } = req.body;
        let result = await autService.getUserByEmail(email);
        if (!result.isMatch) {
            return res.status(404).json({ state: false, message: result.message });
        }
        const resetPasswordCode = generateCode()
        await autService.saveResetPasswordCode(result.user.id, resetPasswordCode);
        await rabbitService.publishUserResetEvent(resetPasswordCode, email);
        res.json({ state: true, message:'A password recovery link has been sent to your email' });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ state: false, message: 'Internal server error' });
    }
}

async function resetConfirmation(req, res) {
    try {
        const { resetPasswordCode } = req.params;
        const result = await autService.resetPassword(resetPasswordCode,req.body.password);
        if(!result.isMatch) {
            return res.status(404).json({state: false, message: result.message });
        }
        res.status(200).json({state: true, message: 'Data successfully updated'});
    } catch (error){
        console.error('Error during reset confirmation:', error);
        return res.status(500).json({ state: false, message: 'Internal server error' });
    }
}

module.exports = {
    login,
    register,
    resetConfirmation,
    passwordReset,
    confirmTwoFactor,
}