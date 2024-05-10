const autService = require('../service/authenticationService')
const rabbitService = require('../service/rabbitService');
const {generateToken} = require('../controllers/TokenController');
const amqplib = require ('amqplib');
const {response} = require("express");

async function register(req, res) {
    try {
        const queue = 'user_registration_queue',
            responseQueue = 'registration_response_queue';

        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(queue);
        await channel.assertQueue(responseQueue);

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(req.body)));
        channel.consume(responseQueue, async (message) => {
            if (message !== null) {
                const resp = JSON.parse(message.content.toString());
                channel.ack(message);
                await channel.close();
                await connection.close();
                res.status(201).json(resp);
            }
        });

    } catch (error) {
        console.error('Error sending user registration request:', error);
        res.status(500).json({ error: 'Internal server error' });
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

}

async function passwordReset(req, res) {

}

async function resetConfirmation(req, res) {

}

module.exports = {
    login,
    register,
    resetConfirmation,
    passwordReset,
    confirmTwoFactor,
}