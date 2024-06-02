import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useRef, useState} from "react";
import Typography from "@mui/material/Typography";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import Layer from "../Layer";

function ProjectLayers({ canvas }) {
    const [objects, setObjects] = useState([]);
    const projectSettings = useContext(EditorContext);
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
                if(object.withPoints){
                    canvas.remove(object.p1);
                    canvas.remove(object.p2);
                }
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
            canvas.on('selection:created', (opt) => {
                const active = canvas.getActiveObjects();
                if(active.length === 1 && active[0].withPoints)
                    active[0].p1.visible = active[0].p2.visible = true;
                setActiveObjects(active)
            });
            canvas.on('selection:updated', () => {
                const active = canvas.getActiveObjects();
                canvas.getObjects().map((item, index) => {
                    if(item.withPoints && item.p1 !== active[0] && item.p2 !== active[0]){
                        item.p1.visible = item.p2.visible = false;
                    }
                })
                if(active.length === 1 && active[0].withPoints)
                    active[0].p1.visible = active[0].p2.visible = true;

                setActiveObjects(active)
            });
            canvas.on('selection:cleared', () => {
                canvas.getObjects().map((item, index) => {
                    if(item.withPoints){
                        item.p1.visible = item.p2.visible = false;
                    }
                })
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
                    !item.needToHide && (
                        <Layer key={index} item={item} canvas={canvas} index={index} sameItemNumber={calculateItemNumber(item)} />
                    )
                ))}
            </Stack>
        </>
    )
}

export default ProjectLayers;
