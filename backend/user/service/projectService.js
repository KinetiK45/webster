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

async function createNewProject(project_name, userId) {
    try {
        if (userId === undefined) {
            return { status: 401, isMatch: false, message: "Authorization required" };
        }
        const user = await userRepository.findOne( {where: { id: userId }});
        if (!user) {
            return { status: 404, isMatch: false, message: "User not found" };
        }

        const existingProject = await projectRepository.findOne({
            where: {
                project_name: project_name,
                user: user,
            }
        });

        if (existingProject) {
            return { status: 400, isMatch: false, message: "Project with this name already exists" };
        }

        const newUserProject = projectRepository.create({
            project_name: project_name,
            user: user,
            projectImageUrl: ''
        });

        await projectRepository.save(newUserProject);
        return { isMatch: true, message: "Project create successfully", data: newUserProject.id };
    } catch (error) {
        console.error("Error creating project:", error);
        throw Error;
    }
}


async function getProjectByUserId(userId, page, pageSize) {
    try {
        if (userId === undefined) {
            return { status: 400, isMatch: false, message: "User ID is required" };
        }
        const [projects, total] = await projectRepository.findAndCount({
            where: { user: { id: userId } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        if (!projects.length) {
            return { status: 200, isMatch: true, message: "User has no projects", projects: [] };
        }
        return {
            isMatch: true,
            projects: projects,
            currentPage: page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        console.error("Error getting user projects:", error);
        throw error;
    }
}


async function getProjectById(project_id) {
    try {
        if(project_id === undefined){
            return { status: 400, isMatch: false, message: "Project ID is required" };
        }
        const project = await projectRepository.find({where: {id: project_id}, relations: ['user'],select: ["user.id"]});
        if(!project) {
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        return { isMatch: true, message: "User project", project: project };
    } catch (error) {
        console.error("Error get project by id:", error);

    }
}

async function updateProject(project_id,project_name, userId){
    try {
        if (userId === undefined) {
            return { status: 401, isMatch: false, message: "Authorization required" };
        }
        const project = await projectRepository.findOne({ where: { id: Number.parseInt(project_id) } });
        if(userId !== project.user.id){
            return { status: 400, isMatch: false, message: "It's not your project" };
        }
        if (!project) {
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        const updates = {};
        if (project_name) {
            updates.project_name = project_name;
        }
        const hasUpdates = Object.keys(updates).length > 0;
        return {
            isMatch: hasUpdates,
            message: hasUpdates ? "Project updated successfully" : "No changes to update",
            ...(hasUpdates && {
                user: {
                    id: project.id,
                    ...(project_name && { project_name }),
                },
            }),
        };
    }catch (error) {
        console.error("Error update project:", error);
        throw Error;
    }
}
async function deleteProject(project_id){
    try {
        const projectToDelete = await projectRepository.findOne(project_id);
        if(!projectToDelete){
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        await userRepository.remove(projectToDelete);
        return {isMatch: true, message: "Project deleted"};
    }catch (error) {
        console.error("Error delete project:", error);
        throw Error;
    }
}
module.exports = {
    createNewProject,
    getProjectByUserId,
    getProjectById,
    updateProject,
    deleteProject
}