const projectService = require('../service/projectService');

async function saveProject(req,res){
    const { project_id } = req.params;
    const { data } = req.body;
    try {
        const result = projectService.saveProject(project_id,data);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Project successfully create", data: result});
    }catch (error) {
        console.error('Error in save project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function getByProjectId(req,res){
    const { project_id } = req.params;
    try {
        const result = projectService.getById(project_id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Project successfully create", data: result});
    }catch (error) {
        console.error('Error in get project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

module.exports = {
    saveProject,
    getByProjectId,

}