const Project = require('../model/projects');
const { createCanvas } = require('canvas');
const { JSDOM } = require('jsdom');
const fabric = require('fabric').fabric;
const {sendToS3PutCommand} = require("../config/s3Client");
const getFileExtension = require("../helpers/FileExtension");
const {publishUpdateProjectEvent} = require("./rabbitService");


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

async function createImage(project_id,jsonData,project_name) {
    try {
        const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="c"></canvas></body></html>`);
        global.window = dom.window;
        global.document = dom.window.document;
        const canvas = new fabric.StaticCanvas('c');
        canvas.loadFromJSON(jsonData, async () => {
            const outCanvas = createCanvas(canvas.width, canvas.height);
            const ctx = outCanvas.getContext('2d');
            ctx.drawImage(canvas.getElement(), 0, 0);
            const buffer = outCanvas.toBuffer('image/png');
            const fileExtension = getFileExtension(buffer);
            const objectKey = `userProject/${project_name}${fileExtension}`;
            await sendToS3PutCommand(objectKey, buffer,'image/png');
            console.log("File uploaded to S3");
            await publishUpdateProjectEvent(project_id,objectKey)
        });
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
    deleteProject,
    createImage
}