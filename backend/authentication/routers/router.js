const Router = require('express');
const authentication = require('./authenticationRouter');

const router = new Router();

router.use('/v1/api/auth', authentication);

module.exports = router;