const { body } = require('express-validator');
const myDataSourcePromise = require("../config/ormSource");
const {Users} = require("../model/users");

let userRepository= (async () => {
    try {
        const myDataSource = await myDataSourcePromise;
        userRepository = myDataSource.getRepository(Users);
    } catch (error) {
        console.error("Error initializing userRepository:", error);
        throw error;
    }
})();

const registrationValidationChain = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 45 })
        .withMessage('Username must be between 3 and 45 characters long')
        .custom(async (value) => {
            const user = await userRepository.findOne({ where: { username:value } });
            if (user) {
                throw new Error('Username is already taken');
            }
        }),
    body('password')
        .trim()
        .isLength({ min: 6, max: 70 })
        .withMessage('Password must be at least 6 characters long'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .custom(async (value) => {
            const user = await userRepository.findOne({ where: { email:value } });
            if (user) {
                throw new Error('Email is already registered');
            }
        }),
    body('full_name')
        .trim()
        .isLength({ min: 3, max: 60 })
        .withMessage('Full name must be between 3 and 60 characters long'),
];

const loginValidationChain = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 45 })
        .withMessage('Username must be between 3 and 45 characters long')
        .isString()
        .withMessage('Username must be a string'),
    body('password')
        .trim()
        .isLength({ min: 5, max: 70 })
        .withMessage('Password must be at least 6 characters long')
        .isString()
        .withMessage('Password must be a string')
];

const editProfileValidationChain = [
    body('old_password')
        .optional()
        .trim()
        .isLength({ min: 3, max: 45 })
        .withMessage('Username must be between 3 and 45 characters long')
        .isString()
        .withMessage('Old password must be a string'),
    body('password')
        .optional()
        .trim()
        .isString()
        .withMessage('Password must be a string'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .custom(async (value) => {
            const user = await userRepository.findOne({ where: { email:value } });
            if (user) {
                throw new Error('Email is already registered');
            }
        }),
    body('full_name')
        .optional()
        .trim()
        .isString()
        .withMessage('Full name must be a string')
];

module.exports = {
    registrationValidationChain,
    loginValidationChain,
    editProfileValidationChain
}