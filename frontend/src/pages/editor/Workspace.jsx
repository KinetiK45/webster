import {Grid} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {AddPhotoAlternateOutlined, Gesture, RectangleOutlined} from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ProjectLayers from "../../components/editor/ProjectLayers";
import React, {useContext, useEffect, useState} from "react";
import {fabric} from "fabric";
import ProjectParams from "../../components/editor/ProjectParams";
import {Editor} from "./Editor";
import {EditorContext} from "./EditorContextProvider";

export function Workspace() {
    const [canvas, setCanvas] = useState(undefined);
    const projectSettings = useContext(EditorContext);
    const initCanvas = () => {
        // let width = 400;
        let width = document.getElementById('canvas').clientWidth;
        // let height = 300;
        let height = document.getElementById('canvas').clientHeight;
        return new fabric.Canvas('canvas', {
            width: width,
            height: height,
            backgroundColor: projectSettings.backgroundColor,
            selectable: true,
        });
    };
    useEffect(() => {
        setCanvas(initCanvas());
    }, []);

    function saveCanvas() {
        const json = canvas.toJSON();
        console.log(json);
    }

    return (
        <Grid container spacing={0} sx={{marginTop: 0, height: '100vh'}}>
            <Grid item xs={12} style={{padding: 0}}>
                {canvas &&
                    <Editor canvas={canvas}/>
                }
            </Grid>
            <Grid item xs={3} sx={{padding: 0, height: '100%'}}>
                {canvas &&
                    <ProjectLayers canvas={canvas}/>
                }
            </Grid>
            <Grid item xs={7} sx={{padding: 0}}>
                <canvas id="canvas" style={{width: '100%', height: '100%'}}/>
            </Grid>
            <Grid item xs={2} sx={{padding: 0}}>
                {canvas &&
                    <ProjectParams canvas={canvas}/>
                }
            </Grid>
        </Grid>
    )
}
