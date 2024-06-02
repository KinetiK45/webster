import React, {useContext, useEffect, useState} from 'react';
import {Divider, MenuItem, Select, Stack, TextField, Typography} from '@mui/material';
import FontFaceObserver from 'fontfaceobserver';
import {customAlert} from "../../utils/Utils";
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import MainColorPicker from "./MainColorPicker";
import FontSelector from "./FontSelector";
import Button from "@mui/material/Button";
import Requests from "../../api/Requests";
import {UserContext} from "../../RootLayout";

function ProjectParams({canvas}) {
    const projectSettings = useContext(EditorContext);
    const {userData} = useContext(UserContext);


    function saveProject(event) {
        console.log(canvas.toJSON());
        if (projectSettings.projectId === undefined && !userData) {
            // TODO: save project & redirect to login page + create project after login
            customAlert('Authorization is required', 'warning')
        } else if (projectSettings.projectId === undefined && userData) {
            // TODO: project create
            customAlert('Create project not specified =)', 'error');
        } else
            Requests.saveProject(projectSettings.projectId, canvas.toJSON())
                .then((resp) => {
                    customAlert(resp.state ? 'Saved' : 'Error',
                        resp.state ? 'success' : 'error')
                })
                .catch((e) => {
                    customAlert(e.toString(), 'error')
                })
    }
    const fonts = [
        'Times New Roman', 'Pacifico', 'VT323', 'Quicksand', 'Inconsolata'
    ]
    const loadAndUseFont = (font) => {
        const myFont = new FontFaceObserver(font);
        console.log(myFont);
        myFont.load()
            .then(() => {
                if (canvas) {
                    const activeObject = canvas.getActiveObject();
                    if (activeObject){
                        activeObject.set("fontFamily", font);
                        canvas.requestRenderAll();
                    }
                    else
                        projectSettings.setFontFamily(font);
                }
            })
            .catch((e) => {
                console.error('Font loading failed:', e);
                customAlert(`Font loading failed: ${font}`, 'error');
            });
    };

    const handleFontChange = (event) => {
        const newFont = event.target.value;
        projectSettings.setFontFamily(newFont)
        loadAndUseFont(newFont);
    };

    const handleColorChange = (event) => {
        const color = event.target.value;
        projectSettings.setFillColor(color);

        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                if(activeObject.type === 'line')
                    activeObject.set("stroke", color);
                else activeObject.set("fill", color);
                canvas.requestRenderAll();
            } else {
                customAlert('Please select an object on the canvas first.', 'warning');
            }
        }
    };

    return (
        <>
            <Divider/>
            <Stack direction="column" sx={{p: 1, m: 0, backgroundColor: 'background.default'}}>
                <Typography variant="h3" sx={{m: 'auto'}}>
                    Settings:
                </Typography>
                <Divider/>
                <FontSelector canvas={canvas}/>
                <MainColorPicker canvas={canvas}/>
                <Button variant="outlined" onClick={saveProject}>Save project</Button>
            </Stack>
        </>
    );
}

export default ProjectParams;
