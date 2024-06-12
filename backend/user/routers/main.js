const mainRouter = require('express');
const router = new mainRouter;
const project = require('../controllers/ProjectController');

router.get('/page', project.getAllProject);

module.exports = router;
