import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import Layer from "../Layer";

function ProjectLayers({ canvas }) {
    const [objects, setObjects] = useState([]);
    const projectSettings = useContext(EditorContext);

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
                projectSettings.setActiveObjects(canvas.getActiveObjects())
            });
            canvas.on('selection:updated', () => {
                projectSettings.setActiveObjects(canvas.getActiveObjects())
            });
            canvas.on('selection:cleared', () => {
                projectSettings.setActiveObjects([]);
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
