const Router = require('express');
const {loginValidationChain, registrationValidationChain} = require("./validators/users.js");
const validateRequest = require("./middleware/validateRequest.js");
const authentication = require("../authentication/controllers/AuthenticationController.js");
const {deactivateToken} =  require("./controllers/TokenController.js");
const loginLimiter = require("./middleware/loginLimiter");
const router = new Router;

router.post('/api/auth/register', registrationValidationChain, validateRequest, authentication.register);
router.post('/api/auth/login', loginLimiter ,loginValidationChain, validateRequest, authentication.login);
router.post('/api/auth/login-confirm',authentication.confirmTwoFactor);
router.post('/api/auth/logout', deactivateToken);
router.post('/api/auth/password-reset', authentication.passwordReset);
router.post('/api/auth/password-reset/:resetPasswordCode', authentication.resetConfirmation);

module.exports = router;