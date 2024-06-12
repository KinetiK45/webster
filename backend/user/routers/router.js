const Router = require('express');
const users = require('./userRouter')
const project = require('./projectRouter')
const router = new Router();
const main = require('./main');

router.use('/v1/api/users', users);
router.use('/v1/api/projects', project);
router.use('/v1/api/main', main);

module.exports = router;