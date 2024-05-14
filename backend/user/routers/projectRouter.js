const UserRouter = require('express');
const router = new UserRouter;
const project = require('../controllers/ProjectController');

router.get('/:project_id', project.getProject);
router.get('/getAllProjects/:user_id',project.getProjects);
router.patch('/:project_id/update', project.updateProject);
router.delete('/:project_id/delete', project.deleteProject);
module.exports = router;