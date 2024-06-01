const projectService = require('../service/projectService');
const rabbitService = require('../service/rabbitService');
async function createProject(req,res){
    const {project_name} = req.body;
    try {
        const userId = req.senderData?.id;
        const result = await projectService.createNewProject(project_name,userId);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        // TODO: return projectId
        res.status(200).json({ state: true, message: "Project successfully create", data: result.data });
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
        const result = await projectService.updateProject(project_id,project_name,userId);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Project successfully update" });
    }catch (error) {
        console.error('Error in update project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}
async function getProject(req,res){
    const {project_id} = req.params;
    try {
        const userId = req.senderData?.id
        console.log(userId);
        const result = await projectService.getProjectById(project_id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        if (userId === result.project[0].user.id) {
            return res.status(200).json({ state: true, message: "Project ", isMatch: true});
        }
        const projectsWithoutUser = result.project.map(project => {
            const { user, ...rest } = project;
            return rest;
        });
        res.status(200).json({ state: true, message: "Project ", data: projectsWithoutUser});
    }catch (error) {
        console.error('Error in get project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function getProjects(req,res){
    const {user_id} = req.params;
    try {
        const result = await projectService.getProjectByUserId(user_id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, message: "Project successfully update", data: result.projects });
    }catch (error) {
        console.error('Error in update project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}


async function deleteProject(req,res){
    const { project_id } = req.params;
    try {
        const result = await projectService.deleteProject(project_id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        await rabbitService.publishDeleteProjectEvent(project_id);
        res.status(200).json({ state: true, message: "Project successfully deleted" });
    }catch (error) {
        console.error('Error in delete project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}
module.exports = {
    createProject,
    updateProject,
    getProject,
    getProjects,
    deleteProject
}