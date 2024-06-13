import React, {useEffect, useState} from "react";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {customAlert} from "../utils/Utils";
import SubLayer from "./SubLayer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditorTextInput from "./inputs/EditorTextInput";
import Box from "@mui/material/Box";

function Layer({canvas, item}) {
    const [isActive, setIsActive] = useState(false);
    const [nameEditMode, setNameEditMode] = useState(false);
    const [layerName, setLayerName] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const isGroup = item && item.type === 'group' && item.name !== 'vector';
    const [expanded, setExpanded] = useState(false);
    const handleToggleExpand = (event) => {
        event.stopPropagation();
        setExpanded(!expanded);
    };
    const toggleLock = () => {
        const object = canvas.getObjects()[item.index];
        object.set({
            evented: isLocked,
            selectable: isLocked,
            hasControls: isLocked
        })
        setIsLocked(!isLocked);
        canvas.discardActiveObject();
    };

    const toggleVisibility = () => {
        const object = canvas.getObjects()[item.index];
        object.visible = !isVisible;
        setIsVisible(!isVisible);
        canvas.discardActiveObject();
    };

    function selectObject() {
        canvas.isDrawingMode = false;
        const object = canvas.getObjects()[item.index];
        if (isActive) {
            setNameEditMode(true);
        }
        else {
            setIsActive(true);
            canvas.setActiveObject(object);
            canvas.renderAll();
        }
    }

    function handleBlur() {
        const object = canvas.getObjects()[item.index];
        object.set({name: layerName});
        canvas.fire('object:modified', {target: object})
        setNameEditMode(false);
    }

    function deleteObject(event) {
        event.stopPropagation();
        if (canvas) {
            const object = canvas.getObjects()[item.index];
            if (object) {
                if (object.withPoints) {
                    canvas.remove(object.p1);
                    canvas.remove(object.p2);
                }
                canvas.remove(object);
            }
        }
    }

    useEffect(() => {
        if (canvas) {
            if(item.name)
                setLayerName(item.name);
            else
                setLayerName(item.type);
            const checkAndSet = () => {
                const activeObjects = canvas.getActiveObjects();
                const canvasObjects = canvas.getObjects();
                const currentIndex = item.index;
                setIsActive(activeObjects.some(obj => canvasObjects[currentIndex] === obj));
            };

            canvas.on('selection:created', checkAndSet);
            canvas.on('selection:updated', checkAndSet);
            canvas.on('selection:cleared', checkAndSet);
        }
    }, [canvas, item]);


    return <React.Fragment>
        <Stack direction="row"
               onClick={selectObject}
               sx={{
                   display: "flex", p: 1, justifyContent: "space-between",
                   width: '100%',
                   backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
               }}
        >
            {nameEditMode ? (
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <EditorTextInput
                        icon={<Typography></Typography>}
                        value={layerName}
                        onChange={(value) => setLayerName(value)}
                        onBlur={handleBlur}
                    />
                </Box>
            ) : (
                <Typography sx={{m: "auto"}}>
                    {layerName ? layerName : item.type} { ((item.name && item.count > 1) || !item.name) && item.itemNumber}
                </Typography>
                )
            }
            {
                !nameEditMode &&
                <>
                    {isGroup && (
                        <IconButton onClick={handleToggleExpand}>
                            {expanded ? <ExpandLessIcon fontSize={'small'}/> : <ExpandMoreIcon fontSize={'small'}/>}
                        </IconButton>
                    )}
                    <IconButton
                        onClick={deleteObject}
                    >
                        <DeleteIcon/>
                    </IconButton>
                    <IconButton onClick={toggleLock}>
                        {isLocked ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                    <IconButton onClick={toggleVisibility}>
                        {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                </>
            }
        </Stack>
        {isGroup && expanded && item._objects.map((subObject, index) => (
            <SubLayer key={index} canvas={canvas} level={0} object={subObject} />
        ))}
    </React.Fragment>;
}

export default Layer;
