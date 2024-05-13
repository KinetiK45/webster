const service = require('../service/projectService');
async function createProject(req,res){
    const {project_name} = req.body;
    try {
        const userId = req.senderData?.id;
        const result = await service.createNewProject(project_name,userId);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Project successfully create" });
    }catch (error) {
        console.error('Error in creating project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function updateProject(req,res){
    const {project_name} = req.body;
    const {project_id} = req.params;
    try {
        const userId = req.senderData?.id;
        const result = await service.createNewProject(project_id,project_name,userId);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Project successfully update" });
    }catch (error) {
        console.error('Error in update project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}


module.exports = {
    createProject,

}