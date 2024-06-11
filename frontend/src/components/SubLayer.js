import React, {useEffect, useState} from "react";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function SubLayer({ canvas, object, level }) {
    const isGroup = object && object.type === 'group';
    const [expanded, setExpanded] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const handleToggleExpand = () => {
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

    function findAndRemoveObject() {
        const group = findGroupByIndex(object.groupIndex);
        if (!group) return;

        const objectToRemove = group._objects[object.index];
        if (objectToRemove) {
            group.removeWithUpdate(objectToRemove);
            canvas.fire('object:removed', { target: objectToRemove });
            if(!group._objects.length) canvas.remove(group);
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
            canvas.setActiveObject(objectToActivate);
            canvas.renderAll();
        }
    };

    useEffect(() => {
        if (canvas) {
            const checkAndSet = () => {
                const activeObjects = canvas.getActiveObjects();
                const group = findGroupByIndex(object.groupIndex);
                const objectToActivate = group ? group._objects[object.index] : null;
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
                <Typography sx={{ m: "auto" }}>
                    {object.name ? object.name : object.type} {object.itemNumber}
                </Typography>
                {isGroup && (
                    <IconButton onClick={handleToggleExpand}>
                        {expanded ? <ExpandLessIcon fontSize={'small'}/> : <ExpandMoreIcon fontSize={'small'}/>}
                    </IconButton>
                )}
                <IconButton onClick={deleteObject}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
            {expanded && isGroup && object._objects.map((subObject, idx) => (
                <SubLayer key={idx} canvas={canvas} level={level + 1} object={subObject} />
            ))}
        </React.Fragment>
    );
}

export default SubLayer;