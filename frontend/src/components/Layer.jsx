import React, {useEffect, useState} from "react";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
function Layer({canvas, item, index, sameItemNumber}) {
    const [isActive, setIsActive] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const toggleLock = () => {
        item.set({
            evented: isLocked,
            selectable: isLocked,
            hasControls: isLocked
        })
        setIsLocked(!isLocked);
        canvas.discardActiveObject();
    };

    const toggleVisibility = () => {
        item.visible = !isVisible;
        setIsVisible(!isVisible);
        canvas.discardActiveObject();
    };

    function selectObject() {
        canvas.isDrawingMode = false;
        const object = canvas.getObjects()[index];
        canvas.setActiveObject(object);
        canvas.renderAll();
    }

    function deleteObject(event) {
        event.stopPropagation();
        if (canvas) {
            const object = canvas.getObjects()[index];
            if (object) {
                console.log(object);
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
            const checkAndSet = () => {
                const activeObjects = canvas.getActiveObjects();
                setIsActive(activeObjects.indexOf(item) !== -1)
            }
            canvas.on('selection:created', checkAndSet);
            canvas.on('selection:updated', checkAndSet);
            canvas.on('selection:cleared', checkAndSet);
        }
    }, [canvas]);

    return <React.Fragment>
        <Stack direction="row"
               onClick={selectObject}
               sx={{
                   display: "flex", p: 1, justifyContent: "space-between",
                   width: '100%',
                   backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
               }}
        >
            <Typography sx={{m: "auto"}}>
                {item.type} {item.name ? item.name : sameItemNumber}
            </Typography>
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
        </Stack>
    </React.Fragment>;
}

export default Layer;
