const Project = require('../model/projects');

async function saveProject(project_id, projectData){
    try {
        if (project_id === undefined) {
            return { status: 401, isMatch: false, message: "Id is undefined" };
        }
        const newProject = new Project({
            _id: project_id,
            data: projectData,
        });

        await newProject.save();
        return { isMatch: true, message: "Save successfully", project: newProject};
    }catch (error) {
        throw Error;
    }
}

async function getById(project_id){
    try {
        if (project_id === undefined) {
            return { status: 401, isMatch: false, message: "Id is undefined" };
        }
        const result = Project.findById(project_id);
        if(!result) {
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        return { isMatch: true, message: "Save successfully", data: result};
    } catch (error) {
        throw Error;
    }
}

async function deleteProject(project_id){
    try {
        const result = await Project.findByIdAndDelete(project_id);
        if (!result) {
            throw new Error('Проект не найден');
        }
        return 'Проект успешно удален';
    } catch (error) {
        throw Error;
    }
}
module.exports = {
    saveProject,
    getById,
    deleteProject
}