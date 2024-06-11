import {Grid} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {AddPhotoAlternateOutlined, Gesture, RectangleOutlined} from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ProjectLayers from "../../components/editor/ProjectLayers";
import React, {useContext, useEffect, useRef, useState} from "react";
import {fabric} from "fabric";
import ProjectParams from "../../components/editor/ProjectParams";
import {Editor} from "./Editor";
import {EditorContext} from "./EditorContextProvider";
import Container from "@mui/material/Container";

export function Workspace() {
    const [canvas, setCanvas] = useState(undefined);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const canvasContainerRef = useRef(null);
    const projectSettings = useContext(EditorContext);
    const initCanvas = () => {
        if (localStorage.getItem('project')){
            let canvas = new fabric.Canvas('canvas');
            canvas.loadFromJSON(localStorage.getItem('project'), canvas.renderAll.bind(canvas));
            return canvas;
        }
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

    // disable page scrolling
    useEffect(() => {
        console.log('ds');
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);
    // canvas resize listener
    useEffect(() => {
        console.log('resize set');
        if (canvas) {
            const resizeCanvas = () => {
                if (canvas) {
                    canvas.setWidth(canvasContainerRef.current.clientWidth);
                    canvas.setHeight(canvasContainerRef.current.clientHeight);
                    console.log('resized');
                }
            };
            resizeCanvas();

            window.addEventListener('resize', resizeCanvas);

            return () => {
                window.removeEventListener('resize', resizeCanvas);
            };
        }
    }, [canvasContainerRef, canvas]);

    // zoom TODO: fix Ivan
    useEffect(() => {
        console.log('zoom');
        if (canvas) {
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
            canvas.on('drop', function(event) {
                event.e.stopPropagation();
                event.e.stopImmediatePropagation();
                event.e.preventDefault();

                if(event.e.dataTransfer.files.length > 0){
                    let files = event.e.dataTransfer.files;
                    for (var i = 0, f; f = files[i]; i++) {
                        if (f.type.match('image.*')) {
                            var reader = new FileReader();
                            reader.onload = function(evt) {
                                fabric.Image.fromURL(evt.target.result, function(obj) {

                                    obj.scaleToHeight(canvas.height);

                                    obj.set('strokeWidth',0);

                                    canvas.add(obj);

                                });
                            };
                            reader.readAsDataURL(f);
                        }
                    }
                }
            });
        }
    }, [canvas]);

    return (
        <Grid container spacing={0} sx={{marginTop: 0,
            height: `calc(100vh - ${128}px)`,
        }}>
            <Grid item xs={12} style={{padding: 0}}>
                {canvas &&
                    <Editor canvas={canvas}/>
                }
            </Grid>
            <Grid item xs={2} sx={{padding: 0, height: '100%'}}>
                {canvas &&
                    <ProjectLayers canvas={canvas}/>
                }
            </Grid>
            <Grid item xs={8} sx={{padding: 0, height: '100%'}}>
                <Container ref={canvasContainerRef} disableGutters sx={{height: '100%'}}>
                    <canvas id="canvas"/>
                </Container>
            </Grid>
            <Grid item xs={2} sx={{padding: 0, height: '100%'}}>
                {canvas &&
                    <ProjectParams canvas={canvas}/>
                }
            </Grid>
        </Grid>
    )
}
