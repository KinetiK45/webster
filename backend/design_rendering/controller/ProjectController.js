const projectService = require('../service/projectService');

async function saveProject(req,res){
    const { project_id } = req.params;
    // console.log(req.body);
    try {
        const result = await projectService.saveProject(Number.parseInt(project_id,10), req.body);
        if (!result.isMatch) {
            return res.status(result.status).json({state: false, message: result.message});
        }
        await projectService.createImage(project_id,req.body);
        res.status(200).json({ state: true, data: result.project._id});
    }catch (error) {
        console.error('Error in save project:', error);
        res.status(500).json({state: false, message: "Internal server error"});
    }
}

async function getByProjectId(req, res) {
    const {project_id} = req.params;
    try {
        const result = await projectService.getById(project_id);
        if (!result.isMatch) {
            return res.status(result.status).json({state: false, message: result.message});
        }
        const { project } = result;

        res.status(200).json({state: true, ...project});
    } catch (error) {
        console.error('Error in get project:', error);
        res.status(500).json({state: false, message: "Internal server error"});
    }
}

module.exports = {
    saveProject,
    getByProjectId,
}