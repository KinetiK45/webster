const UserRouter = require('express');
const router = new UserRouter;
const project = require('../controllers/ProjectController');

router.get('/:project_id', project.getProject);
router.get('/getAllProjects/:user_id',project.getProjects);
router.patch('/:project_id', project.updateProject);
router.delete('/:project_id', project.deleteProject);
router.post('/create',project.createProject);
module.exports = router;