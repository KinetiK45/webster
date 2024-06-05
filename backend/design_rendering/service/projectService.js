const Project = require('../model/projects');
const { createCanvas } = require('canvas');
const { JSDOM } = require('jsdom');
const fabric = require('fabric').fabric;
const {sendToS3PutCommand} = require("../config/s3Client");
const getFileExtension = require("../helpers/FileExtension");
const {publishUpdateProjectEvent} = require("./rabbitService");


async function saveProject(project_id, projectData) {
    try {
        if (project_id === undefined) {
            return { status: 401, isMatch: false, message: "Id is undefined" };
        }
        const existingProject = await Project.findOne({ _id: project_id });
        if (existingProject) {
            await Project.findOneAndUpdate({ _id: project_id }, { data: projectData });
            return { isMatch: true, message: "Update successfully", project: existingProject };
        } else {
            const newProject = new Project({
                _id: project_id,
                data: projectData,
            });
            await newProject.save();
            return { isMatch: true, message: "Save successfully", project: newProject };
        }
    } catch (error) {
        console.error("Error in save project:", error);
        throw  error;
    }
}


async function getById(project_id){
    try {
        if (project_id === undefined) {
            return { status: 401, isMatch: false, message: "Id is undefined" };
        }
        const result = await Project.findById(project_id);
        if(!result) {
            return { status: 404, isMatch: false, message: "Project not found" };
        }
        const resultObject = result.toObject({ versionKey: false });
        return { isMatch: true, data: resultObject};
    } catch (error) {
        throw error;
    }
}

async function createImage(project_id, jsonData) {
    try {
        const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
        global.window = dom.window;
        global.document = dom.window.document;

        // Create canvas element using regular DOM API
        const canvasElement = global.document.createElement('canvas');
        canvasElement.id = 'c';
        global.document.body.appendChild(canvasElement);

        // Initialize fabric canvas
        const canvas = new fabric.StaticCanvas('c');
        canvas.loadFromJSON(jsonData, async () => {
            const outCanvas = createCanvas(canvas.width, canvas.height);
            const ctx = outCanvas.getContext('2d');
            // Access canvas element directly from fabric canvas object
            const imageElement = canvas.lowerCanvasEl; // Access canvas element directly
            if (imageElement) {
                ctx.drawImage(imageElement, 0, 0);//error there
                const buffer = outCanvas.toBuffer('image/png');
                const fileExtension = getFileExtension(buffer);
                const objectKey = `userProject/project${project_id}${fileExtension}`;
                await sendToS3PutCommand(objectKey, buffer, 'image/png');
                console.log("File uploaded to S3");
                await publishUpdateProjectEvent(project_id, objectKey);
            } else {
                throw new Error("Invalid canvas element");
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
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