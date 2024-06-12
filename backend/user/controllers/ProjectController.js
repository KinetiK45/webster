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
        res.status(200).json({ state: true, data: result.data });
    }catch (error) {
        console.error('Error in creating project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function updateProject(req,res){
    const {project_name} = req.body;
    const {project_id} = req.params;
    try {
        const result = await projectService.updateProject(project_id,project_name);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true });
    }catch (error) {
        console.error('Error in update project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}
async function getProject(req,res){
    const {project_id} = req.params;
    try {
        const result = await projectService.getProjectById(project_id);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, data: result.project});
    }catch (error) {
        console.error('Error in get project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function getProjects(req,res){
    const {user_id} = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const requestedId = user_id === 'me' ? req.senderData?.id : parseInt(user_id, 10);
        const result = await projectService.getProjectByUserId(requestedId, page, pageSize);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, data: result.projects, currentPage: result.currentPage,  total: result.total, totalPages: result.totalPages });
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
        res.status(200).json({ state: true });
    }catch (error) {
        console.error('Error in delete project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

async function getAllProject(req,res){
    const { page = 1, pageSize = 10 } = req.query;
    try {
        const result = await projectService.getAllProject(page, pageSize);
        if (!result.isMatch) {
            return res.status(result.status).json({ state: false, message: result.message });
        }
        res.status(200).json({ state: true, data: result.projects, currentPage: result.currentPage, totalPages: result.totalPages });
    }catch (error) {
        console.error('Error in get all project:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
}

module.exports = {
    createProject,
    updateProject,
    getProject,
    getProjects,
    deleteProject,
    getAllProject
}