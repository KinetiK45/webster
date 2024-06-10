import React, {useContext, useEffect, useRef, useState} from "react";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import {fabric} from "fabric";
import IconButton from "@mui/material/IconButton";
import {AddPhotoAlternateOutlined} from "@mui/icons-material";

function Image({ canvas, changeInstrument, handleButtonClick, activeButtonFromIcons }) {
    const projectSettings = useContext(EditorContext);
    function addImage() {
        changeInstrument('image', false, true);
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgData = e.target.result;
                fabric.Image.fromURL(imgData, function (img) {
                    canvas.add(img);
                    changeInstrument('', canvas.isDrawingMode, canvas.selection);
                });
            };
            reader.readAsDataURL(file);
        });

        input.click();
    }
    return (
        <IconButton
            sx={{ backgroundColor: activeButtonFromIcons === 'add-image' ? 'grey' : 'transparent' }}
            edge="start"
            color="inherit"
            aria-label={'add-image'}
            onClick={(event) => handleButtonClick(event, 'add-image', addImage)}
        >
            <AddPhotoAlternateOutlined/>
        </IconButton>
    );
}

export default Image;