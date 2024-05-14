const Router = require('express');
const users = require('./userRouter')
const project = require('./projectRouter')
const router = new Router();

router.use('/v1/api/users', users);
router.use('/v1/api/projects', project);

module.exports = router;