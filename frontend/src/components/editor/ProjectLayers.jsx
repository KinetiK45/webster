import {Divider, Stack} from "@mui/material";
import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';

function ProjectLayers({
                           canvas,
                       }) {


    const [objects, setObjects] = useState([]);
    const [activeObjects, setActiveObjects] = useState([]);

    function selectObject(index) {
        const object = canvas.getObjects()[index];
        canvas.setActiveObject(object);
        canvas.renderAll();
    }

    function deleteObject(index) {
        if (canvas) {
            // console.log(canvas);
            const object = canvas.getObjects()[index];
            if (object) {
                console.log(object);
                canvas.remove(object);
            }
            // console.log(canvas);
        }
    }

    function calculateItemNumber(item) {
        return objects
            .filter((value) => value.type === item.type)
            .indexOf(item);
    }

    useEffect(() => {
        if (canvas) {
            canvas.on('object:added', () => {
                setObjects(canvas.getObjects())
            });
            canvas.on('object:removed', () => {
                setObjects(canvas.getObjects())
            });
            canvas.on('selection:created', () => {
                setActiveObjects(canvas.getActiveObjects())
            });
            canvas.on('selection:updated', () => {
                setActiveObjects(canvas.getActiveObjects())
            });
            canvas.on('selection:cleared', () => {
                setActiveObjects([]);
            });
        }
    }, [canvas]);

    if (!canvas) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Divider/>
            <Stack direction="column" sx={{p: 1, m: 0, backgroundColor: 'background.default'}}>
                <Typography variant="h3" sx={{m: 'auto'}}>
                    Layouts:
                </Typography>
                <Divider/>
                {objects.length === 0 &&
                    <Typography sx={{m: 'auto'}}>
                        Nothing here...
                    </Typography>
                }
                {objects.map((item, index) => (
                    <React.Fragment key={index}>
                        <Stack direction="row"
                               onClick={() => {
                                   selectObject(index)
                               }}
                               sx={{
                                   display: 'flex', p: 1, justifyContent: 'space-between',
                                   backgroundColor: activeObjects.indexOf(item) === -1 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                   // border: '0.5px solid white'
                               }}
                        >
                            <Typography sx={{m: 'auto'}}>
                                {item.type} {item.name ? item.name : calculateItemNumber(item)}
                            </Typography>
                            <IconButton
                                onClick={(event) => {
                                    event.stopPropagation();
                                    deleteObject(index)
                                }}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </Stack>
                        {index < objects.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Stack>
        </>
    )
}

export default ProjectLayers;
