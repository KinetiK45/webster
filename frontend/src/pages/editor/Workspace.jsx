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
    const [isDrawingMode, setIsDrawingMode] = useState(false);
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
    useEffect(() => {
        if (canvas) {
            // let lastTargetLine = null;
            canvas.on('mouse:wheel', function (opt) {
                var delta = opt.e.deltaY;
                var zoom = canvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();
                var vpt = this.viewportTransform;
                if (zoom < 400 / 1000) {
                    vpt[4] = 200 - 1000 * zoom / 2;
                    vpt[5] = 200 - 1000 * zoom / 2;
                } else {
                    if (vpt[4] >= 0) {
                        vpt[4] = 0;
                    } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
                        vpt[4] = canvas.getWidth() - 1000 * zoom;
                    }
                    if (vpt[5] >= 0) {
                        vpt[5] = 0;
                    } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
                        vpt[5] = canvas.getHeight() - 1000 * zoom;
                    }
                }
            })
            canvas.on('mouse:down', function (opt) {
                var evt = opt.e;
                if (evt.altKey === true) {
                    this.isDragging = true;
                    this.selection = false;
                    this.lastPosX = evt.clientX;
                    this.lastPosY = evt.clientY;
                }
                if (canvas.isDrawingMode) setIsDrawingMode(true);
            });
            canvas.on('mouse:move', function (opt) {
                if (this.isDragging) {
                    var e = opt.e;
                    var vpt = this.viewportTransform;
                    vpt[4] += e.clientX - this.lastPosX;
                    vpt[5] += e.clientY - this.lastPosY;
                    this.requestRenderAll();
                    this.lastPosX = e.clientX;
                    this.lastPosY = e.clientY;
                }
            });
            canvas.on('mouse:up', function (opt) {
                if (canvas.isDrawingMode) setIsDrawingMode(false);
                this.setViewportTransform(this.viewportTransform);
                this.isDragging = false;
                this.selection = true;
            });
        }
    }, [canvas]);
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
