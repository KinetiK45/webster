import {Divider, Stack} from "@mui/material";
import React, {useContext, useEffect, useRef, useState} from "react";
import Typography from "@mui/material/Typography";
import {EditorContext} from "../../pages/editor/EditorContextProvider";
import Layer from "../Layer";
import {getOffsets, getPointerStart, setLineCoordinates, setPointsCoordinates} from "../../utils/CoordinatesUtils";

function ProjectLayers({ canvas }) {
    const [objects, setObjects] = useState([]);
    const projectSettings = useContext(EditorContext);
    const objectsRef = useRef([]);

    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    function calculateItemNumber(item) {
        return objects
            .filter((value) => value.type === item.type)
            .indexOf(item);
    }
    function makePointsVisible(active){
        const object = active[0];
        if(active.length === 1 && object.withPoints){
            object.p1.visible = object.p2.visible = true;
        }
    }
    function setLinePoints(active) {
        objectsRef.current.map((item, index)=> {
            if (item.withPoints) {
                if (item.x1 !== item.p1.left) setLineCoordinates(item);
                item.p1.visible = item.p2.visible = active.includes(item.p1) || active.includes(item.p2);
            }
        });
    }

    useEffect(() => {
        if (canvas) {
            let startX = 0, startY = 0;
            canvas.on('mouse:down', (opt)=> {
                ({ startX, startY } = getPointerStart(canvas, opt))
            });
            canvas.on('object:added', () => {
                setObjects(canvas.getObjects());
            });
            canvas.on('object:removed', () => {
                setObjects(canvas.getObjects());
            });
            canvas.on('selection:created', (opt) => {
                const active = canvas.getActiveObjects();
                makePointsVisible(active);
                projectSettings.setActiveObjects(active);
            });
            canvas.on('selection:updated', () => {
                const active = canvas.getActiveObjects();
                setLinePoints(active);
                makePointsVisible(active);
                projectSettings.setActiveObjects(active);
            });
            canvas.on('selection:cleared', () => {
                setLinePoints([]);
                projectSettings.setActiveObjects([]);
            });
            canvas.on('object:modified', (opt) => {
                if(opt.target.type === 'activeSelection'){
                    opt.target._objects.map((item, index) => {
                        const { offsetX, offsetY} = getOffsets(canvas, opt, startX, startY);
                        if(item.withPoints){
                            setPointsCoordinates(item, offsetX, offsetY);
                        }
                    });
                }
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
