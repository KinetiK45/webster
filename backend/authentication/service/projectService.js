const myDataSourcePromise = require("../config/ormSource");
const {Users} = require("../model/users");
const {Projects} = require("../model/projects");
let userRepository;
let projectRepository;
(async () => {
    try {
        const myDataSource = await myDataSourcePromise;
        userRepository = myDataSource.getRepository(Users);
        projectRepository = myDataSource.getRepository(Projects);
    } catch (error) {
        console.error("Error initializing userRepository:", error);
        throw error;
    }
})();

async function createNewProject(project_name, userId){
    try {
        if (userId === undefined) {
            return { status: 401, isMatch: false, message: "Authorization required" };
        }
        const user = await userRepository.findOne(userId);
        if (!user) {
            return { status: 404, isMatch: false, message: "User not found" };
        }

        const newUserProject = await projectRepository.create({
            project_name: project_name,
            user: user,
        });

        await projectRepository.save(newUserProject);
        return { isMatch: true, message: "Project create successfully", data: newUserProject };
    } catch (error) {
        console.error("Error creating project:", error);
        throw Error;
    }
}

async function getProjectByUserId(project_id){
    try {

    } catch (error) {
        console.error("Error get user projects project:", error);
        throw Error;
    }
}

async function getProjectById(project_id){

}

async function updateProject(project_id,project_name, userId){
    try {

    }catch (error) {
        console.error("Error creating project:", error);
        throw Error;
    }
}

module.exports = {
    createNewProject,
}