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

const editProfileValidationChain = [
    body('password')
        .optional()
        .trim()
        .isLength({ min: 3, max: 45 })
        .withMessage('Username must be between 3 and 45 characters long')
        .isString()
        .withMessage('Old password must be a string'),
    body('new_password')
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
    editProfileValidationChain
}