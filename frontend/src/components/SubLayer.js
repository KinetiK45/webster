import React, {useEffect, useState} from "react";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import EditorTextInput from "./inputs/EditorTextInput";

function SubLayer({ canvas, object, level }) {
    const isGroup = object && object.type === 'group' && object.name !== 'vector';
    const [expanded, setExpanded] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [layerName, setLayerName] = useState('');
    const [nameEditMode, setNameEditMode] = useState(false);

    const toggleLock = () => {
        const objectToActivate = findObject();
        objectToActivate.set({
            evented: isLocked,
            selectable: isLocked,
            hasControls: isLocked
        })
        setIsLocked(!isLocked);
        canvas.discardActiveObject();
    };

    const toggleVisibility = () => {
        const objectToActivate = findObject();
        objectToActivate.set('visible', !isVisible)
        setIsVisible(!isVisible);
        canvas.discardActiveObject();
        canvas.renderAll();
    };

    const handleToggleExpand = (event) => {
        event.stopPropagation();
        setExpanded(!expanded);
    };

    function findGroupByIndex(index) {
        function searchGroup(objects) {
            for (let obj of objects) {
                if (obj.type === 'group' && obj.index === index) {
                    return obj;
                }
                if (obj.type === 'group') {
                    const found = searchGroup(obj._objects);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        }

        return searchGroup(canvas.getObjects());
    }

    function findObject(){
        const group = findGroupByIndex(object.groupIndex);
        return group ? group._objects[object.index] : null;
    }

    function removeEmptyGroups(group) {
        if (!group._objects.length) {
            const parentGroup = group.group;
            if (parentGroup) {
                parentGroup.removeWithUpdate(group);
                canvas.fire('object:removed', { target: group });
                removeEmptyGroups(parentGroup);
            } else {
                canvas.remove(group);
            }
            canvas.renderAll();
        }
    }

    function handleBlur() {
        const objectToChange = findObject();
        objectToChange.set({name: layerName});
        canvas.fire('object:modified', {target: objectToChange})
        setNameEditMode(false);
    }


    function findAndRemoveObject() {
        const objectsGroup = findGroupByIndex(object.groupIndex);
        if (!objectsGroup) return;

        const objectToRemove = objectsGroup._objects[object.index];
        if (objectToRemove) {
            objectsGroup.removeWithUpdate(objectToRemove);
            canvas.fire('object:removed', { target: objectToRemove });

            removeEmptyGroups(objectsGroup);

            canvas.discardActiveObject();
            canvas.renderAll();
        }
    }

    const deleteObject = (event) => {
        event.stopPropagation();
        if (canvas && object) {
            findAndRemoveObject();

        }
    };

    const selectObject = () => {
        canvas.isDrawingMode = false;
        const group = findGroupByIndex(object.groupIndex);
        const objectToActivate = group ? group._objects[object.index] : null;
            if (objectToActivate) {
                if (isActive) {
                    setNameEditMode(true);
                }
                else {
                    objectToActivate.evented = false;
                    canvas.setActiveObject(objectToActivate);
                    canvas.renderAll();
                }
            }
    };

    useEffect(() => {
        if (canvas) {
            if(object.name)
                setLayerName(object.name);
            else
                setLayerName(object.type);
            const checkAndSet = () => {
                const activeObjects = canvas.getActiveObjects();
                const objectToActivate = findObject();
                setIsActive(activeObjects.some(obj => objectToActivate === obj));
            };

            canvas.on('selection:created', checkAndSet);
            canvas.on('selection:updated', checkAndSet);
            canvas.on('selection:cleared', checkAndSet);

            return () => {
                canvas.off('selection:created', checkAndSet);
                canvas.off('selection:updated', checkAndSet);
                canvas.off('selection:cleared', checkAndSet);
            };
        }
    }, [canvas, object]);

    return (
        <React.Fragment>
            <Stack direction="row"
                   spacing={0}
                   onClick={selectObject}
                   sx={{
                       display: "flex", p: 1, justifyContent: "space-between",
                       width: '100%',
                       backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                       paddingLeft: level,
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
                    <Typography sx={{ m: "auto" }}>
                        {object.name ? object.name : object.type} { ((object.name && object.count > 1) || !object.name) && object.itemNumber}
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
                        <IconButton onClick={deleteObject}>
                            <DeleteIcon />
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
            {expanded && isGroup && object._objects.map((subObject, idx) => (
                <SubLayer key={idx} canvas={canvas} level={level + 1} object={subObject} />
            ))}
        </React.Fragment>
    );
}

export default SubLayer;