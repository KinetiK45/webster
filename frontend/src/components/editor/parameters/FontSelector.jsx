import React, {useContext, useEffect, useState} from "react";
import {customAlert} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import FontFaceObserver from "fontfaceobserver";
import EditorSelector from "../../inputs/EditorSelector";
import Tooltip from "@mui/material/Tooltip";

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

    const handleFontChange = (newFont) => {
        projectSettings.fontFamily = newFont;
        setCurrentFontFamily(newFont);
        loadAndUseFont(newFont);
    };

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                console.log(activeObject);
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
        <EditorSelector
            value={currentFontFamily}
            options={fonts.map((font) => ({ label: font, value: font }))}
            icon={<Tooltip title="Font family"><FontDownloadIcon fontSize="small"/></Tooltip>}
            onChange={handleFontChange}
        />
    )
}

export default FontSelector;