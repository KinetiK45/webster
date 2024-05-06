const autService = require('../service/authenticationService')
const rabbitService = require('../service/rabbitService');
const {generateToken} = require('../controllers/TokenController');

async function register(req, res) {
    const { username, password, email, full_name } = req.body;
    try {
        const newUser = await autService.registerUser({ username, password, email, full_name });
        await rabbitService.publishUserRegisteredEvent(newUser.id, newUser.email);
        res.status(201).json({
            state: true,
            message: 'Registration successful!',
            data: {
                id: newUser.id,
            },
        });
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
        // const mailOptions = {
        //     to: result.user.email,
        //     subject: 'Your 2FA Code',
        //     text: `Your two-factor authentication code is: ${twoFactorCode}`,
        // };
        //
        // await transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error(error);
        //     } else {
        //         console.log('Email sent: ', info);
        //     }
        // });

        await autService.saveTwoFactorCode(result.user.id, twoFactorCode);
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
    const { user_id, code } = req.body;
    try {
        const storedCode = await autService.getTwoFactorCode(user_id);
        if (storedCode === code) {
            res.cookie('auth_token', generateToken({ id: user_id }), { httpOnly: true });
            await autService.client.del(`2fa:${user_id}`);
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
    const { email } = req.body;
    let result = await autService.getUserByEmail(email);
    if (!result.isMatch) {
        return res.status(404).json({ state: false, message: result.message });
    }
    const resetPasswordCode = autService.generateCode()
    await autService.saveResetPasswordCode(result.user.id, resetPasswordCode);

//     const link = `${req.headers.origin}/auth/password-reset/${resetPasswordCode}`;
//     const mailOptions = {
//         to: email,
//         subject: 'Password reset',
//         html: `<p>Dear ${result.user.full_name}.</p>
// <p>Your password recovery <a style="font-weight: bold" href="${link}">link</a></p>
// <p style="color: red">You have 10 minutes to use it!</p>
// <p>If you didn't do this, please ignore this message.</p>`
//     };
//
//     await transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error(error);
//             res.status(500).json({ state: false, message: 'Internal server error' })
//         } else {
//             console.log('Email sent: ', info);
//             res.json({ state: true, message:'A password recovery link has been sent to your email' });
//         }
//     });
}

async function resetConfirmation(req, res) {
    try {
        const { resetPasswordCode } = req.params;
        const result = await autService.resetPassword(resetPasswordCode,req.body.password);
        if(!result.state) {
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