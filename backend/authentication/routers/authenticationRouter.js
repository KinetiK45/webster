const AuthenticationRouter = require('express');
const {loginValidationChain, registrationValidationChain} = require("../validators/users.js");
const validateRequest = require("../middleware/validateRequest.js");
const authentication = require("../controllers/AuthenticationController.js");
const {deactivateToken} =  require("../controllers/TokenController.js");
const loginLimiter = require("../middleware/loginLimiter");
const router = new AuthenticationRouter;

router.post('/register', registrationValidationChain, validateRequest, authentication.register);
router.post('/login', loginLimiter ,loginValidationChain, validateRequest, authentication.login);
router.post('/login-confirm',authentication.confirmTwoFactor);
router.post('/logout', deactivateToken);
router.post('/password-reset', authentication.passwordReset);
router.post('/password-reset/:resetPasswordCode', authentication.resetConfirmation);

module.exports = router;