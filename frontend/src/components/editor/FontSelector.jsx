import {MenuItem, Select, Stack, TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../utils/Utils";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import FontFaceObserver from "fontfaceobserver";

function FontSelector({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [currentFontFamily, setCurrentFontFamily] = useState(projectSettings.fontFamily);

    const fonts = [
        'Times New Roman', 'Pacifico', 'VT323', 'Quicksand', 'Inconsolata'
    ];

    const loadAndUseFont = (font) => {
        const myFont = new FontFaceObserver(font);
        myFont.load()
            .then(() => {
                if (canvas) {
                    // TODO: few objects selected + text filter
                    const activeObject = canvas.getActiveObject();
                    if (activeObject) {
                        activeObject.set("fontFamily", font);
                        canvas.requestRenderAll();
                    } else {
                        projectSettings.fontFamily = font;
                        setCurrentFontFamily(font);
                    }
                }
            })
            .catch((e) => {
                console.error('Font loading failed:', e);
                customAlert(`Font loading failed: ${font}`, 'error');
            });
    };

    const handleFontChange = (event) => {
        const newFont = event.target.value;
        projectSettings.fontFamily = newFont;
        setCurrentFontFamily(newFont);
        loadAndUseFont(newFont);
    };

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject?.fontFamily) {
                    projectSettings.fontFamily = activeObject.fontFamily;
                    setCurrentFontFamily(activeObject.fontFamily);
                }
            };

            canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);

            return () => {
                canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
            };
        }
    }, [canvas, projectSettings]);

    return (
        <Stack direction="row" sx={{display: 'flex', alignItems: 'center'}}>
            <FontDownloadIcon/>
            <Select
                value={currentFontFamily}
                onChange={handleFontChange}
                displayEmpty
                sx={{width: '100%', '& .MuiSelect-select': {padding: '8px', marginBottom: 0}}}
            >
                {fonts.map((font, index) => (
                    <MenuItem key={index} value={font}>
                        {font}
                    </MenuItem>
                ))}
            </Select>
        </Stack>
    )
}

export default FontSelector;