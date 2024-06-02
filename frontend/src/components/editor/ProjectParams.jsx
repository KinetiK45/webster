import React, {useContext, useEffect, useState} from 'react';
import {Divider, Stack, Typography, Select, MenuItem, TextField} from '@mui/material';
import FontFaceObserver from 'fontfaceobserver';
import {customAlert} from "../../utils/Utils";
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import CustomInputField from "../inputs/CustomInputField";

function ProjectParams({canvas}) {
    const projectSettings = useContext(EditorContext);

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
                <Stack direction="row" sx={{display: 'flex', alignItems: 'center'}}>
                    <FontDownloadIcon/>
                    <Select
                        value={projectSettings.fontFamily}
                        onChange={handleFontChange}
                        displayEmpty
                        sx={{width: '100%', '& .MuiSelect-select': { padding: '8px' }}}
                    >
                        {fonts.map((font, index) => (
                            <MenuItem key={index} value={font}>
                                {font}
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>
                <TextField
                    label="Choose Color"
                    type="color"
                    value={projectSettings.fillColor}
                    onChange={handleColorChange}
                    sx={{ width: '100%', margin: '8px 0' }}
                />
            </Stack>
        </>
    );
}

export default ProjectParams;
