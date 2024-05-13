const Router = require('express');
const authentication = require('./authenticationRouter');
const users = require('./userRouter')

const router = new Router();

router.use('/v1/api/auth', authentication);
router.use('/v1/api/users', users);

module.exports = router;