const Router = require('express');
const project = require('../controller/ProjectController');
const router = new Router();

router.get('/v1/api/project/:project_id',project.getByProjectId);
router.post('/v1/api/project/:project_id/save', project.saveProject);

module.exports = router;