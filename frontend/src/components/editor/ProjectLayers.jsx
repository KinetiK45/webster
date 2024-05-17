import {Stack} from "@mui/material";
import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";

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
        if (canvas){
            console.log(canvas);
            const object = canvas.getObjects()[index];
            if (object) {
                // console.log(object);
                canvas.remove(object);
            }
            console.log(canvas);
        }
    }

    function calculateItemNumber(item) {
        return objects
            .filter((value) => value.type === item.type)
            .indexOf(item);
    }

    useEffect(() => {
        if (canvas){
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

    if (!canvas){
        return <div>Loading...</div>
    }

    return (
        <Stack direction="column" sx={{p: 1, m: 0}}>
            {objects.map((item, index) => (
                <Stack direction="row" key={index}
                       onClick={() => {selectObject(index)}}
                       sx={{
                           display: 'flex', p: 1, justifyContent: 'space-between',
                           backgroundColor: activeObjects.indexOf(item) === -1 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                           // border: '0.5px solid white'
                       }}
                >
                    <Typography sx={{m: 'auto'}}>
                        {item.type} {item.name ? item.name : calculateItemNumber(item)}
                    </Typography>
                    <Button
                        onClick={(event) => {
                            event.stopPropagation();
                            deleteObject(index)
                        }}
                    >
                        del
                    </Button>
                </Stack>
            ))}
        </Stack>
    )
}

export default ProjectLayers;
