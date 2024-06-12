const myDataSourcePromise = require("../config/ormSource");
const {Users} = require("../model/users");
const {Projects} = require("../model/projects");
const {Photos} = require("../model/photos");
let userRepository;
let projectRepository;
let photoRepository;
(async () => {
    try {
        const myDataSource = await myDataSourcePromise;
        userRepository = myDataSource.getRepository(Users);
        projectRepository = myDataSource.getRepository(Projects);
        photoRepository = myDataSource.getRepository(Photos);
    } catch (error) {
        console.error("Error initializing userRepository:", error);
        throw error;
    }
})();

async function createNewProject(project_name = "Untitled", userId) {
    try {
        if (userId === undefined) {
            return { status: 401, isMatch: false, message: "Authorization required" };
        }
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return { status: 404, isMatch: false, message: "User not found" };
        }
        const existingProjects = await projectRepository.find({
            where: {
                project_name: project_name,
                user: user,
            }
        });
        let newIndex = 1;
        if (existingProjects.length > 0) {
            const maxIndex = Math.max(...existingProjects.map(project => {
                const match = project.project_name.match(/\((\d+)\)$/);
                if (match) {
                    return parseInt(match[1]);
                }
                return 0;
            }));
            newIndex = maxIndex + 1;
        }
        const newProjectName = newIndex > 1 ? `${project_name}(${newIndex})` : project_name;
        const newUserProject = projectRepository.create({
            project_name: newProjectName,
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
        const withUrlProjects = projects.map(project => ({
            id: project.id,
            project_name: project.project_name,
            updated_at: project.updated_at,
            created_at: project.created_at,
            userId: project.userId,
            projectImageUrl: `https://ucodewebster.s3.amazonaws.com/${project.projectImageUrl}`
        }));
        return {
            isMatch: true,
            projects: withUrlProjects,
            currentPage: page,
            total: total,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        console.error("Error getting user projects:", error);
        throw error;
    }
}

async function getAllProject(page, pageSize, dateTo, dateFrom, userId) {
    try {
        const query = projectRepository.createQueryBuilder('project')
            .leftJoinAndSelect('project.user', 'user')
            .leftJoinAndSelect('user.photos', 'photos')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy('project.id', 'ASC');

        if (new Date(dateFrom).toString() !== 'Invalid Date') {
            const dateFromString = new Date(dateFrom).toISOString();
            query.andWhere('project.created_at >= :dateFromString', { dateFromString });
        }
        if (new Date(dateTo).toString() !== 'Invalid Date') {
            const dateToString = new Date(dateTo).toISOString();
            query.andWhere('project.created_at <= :dateToString', { dateToString });
        }
        if(userId !== undefined){
            query.andWhere('project.user.id = :userId', { userId });
        }
        const [projects, total] = await query.getManyAndCount();

        if (!projects.length) {
            return { status: 200, isMatch: true, message: "User has no projects", projects: [] };
        }

        const withUrlProjects = projects.map(project => {
            const photoUrl = project.user && project.user.photos ? project.user.photos.url : null;
            const creatorAvatarLink = photoUrl ? `https://ucodewebster.s3.amazonaws.com/${photoUrl}` : `https://ucodewebster.s3.amazonaws.com/img.png`;

            return {
                id: project.id,
                project_name: project.project_name,
                updated_at: project.updated_at,
                created_at: project.created_at,
                projectImageUrl: `https://ucodewebster.s3.amazonaws.com/${project.projectImageUrl}`,
                creatorId: project.user.id,
                creatorName: project.user.full_name,
                creatorAvatarLink: creatorAvatarLink
            };
        });
        return {
            isMatch: true,
            projects: withUrlProjects,
            currentPage: page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        throw error;
    }
}

async function getProjectById(project_id) {
    try {
        if(project_id === undefined){
            return { status: 400, isMatch: false, message: "Project ID is required" };
        }
        const project = await projectRepository.findOne({where: {id: project_id}});
        if(!project) {
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        return { isMatch: true, message: "User project", project:{
            id: project.id,
            project_name: project.project_name,
            updated_at: project.updated_at,
            created_at: project.created_at,
            userId: project.userId,
            projectImageUrl: `https://ucodewebster.s3.amazonaws.com/${project.projectImageUrl}`
            } };
    } catch (error) {
        console.error("Error get project by id:", error);

    }
}

async function updateProject(project_id, project_name, projectImageUrl) {
    try {
        const project = await projectRepository.find({where: {id: project_id}});

        if (!project) {
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        const updates = {};
        if (project_name) {
            updates.project_name = project_name;
        }
        if (projectImageUrl) {
            updates.projectImageUrl = projectImageUrl;
        }

        updates.updated_at = new Date().toISOString()

        const hasUpdates = Object.keys(updates).length > 0;
        if (hasUpdates) {
            Object.assign(project, updates);
            await projectRepository.save(project);
        }

        return {
            isMatch: hasUpdates,
            message: hasUpdates ? "Project updated successfully" : "No changes to update",
        };
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
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
    deleteProject,
    getAllProject
}