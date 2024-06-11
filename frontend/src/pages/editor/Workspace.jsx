import {Grid} from "@mui/material";
import ProjectLayers from "./ProjectLayers";
import React, {useContext, useEffect, useRef, useState} from "react";
import {fabric} from "fabric";
import ProjectParams from "./ProjectParams";
import {ToolBar} from "./ToolBar";
import {EditorContext} from "./EditorContextProvider";
import Container from "@mui/material/Container";
import {useParams} from "react-router-dom";
import Requests from "../../api/Requests";
import {customAlert} from "../../utils/Utils";

export function Workspace() {
    const {projectId} = useParams();
    const [canvas, setCanvas] = useState(undefined);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const canvasContainerRef = useRef(null);
    const projectSettings = useContext(EditorContext);
    const initCanvas = async () => {
        if (projectId !== 'create') {
            const resp = await Requests.getProjectCanvas(projectId);
            if (resp.state === true) {
                // TODO: canvas size to params
                let canvas = new fabric.Canvas('canvas');
                canvas.loadFromJSON(resp.data, canvas.renderAll.bind(canvas));
                return canvas;
            }
        }
        if (localStorage.getItem('project')) {
            let canvas = new fabric.Canvas('canvas');
            canvas.loadFromJSON(localStorage.getItem('project'), canvas.renderAll.bind(canvas));
            return canvas;
        }
        let width = document.getElementById('canvas').clientWidth;
        let height = document.getElementById('canvas').clientHeight;
        return new fabric.Canvas('canvas', {
            width: width,
            height: height,
            backgroundColor: projectSettings.backgroundColor,
            selectable: true,
        });
    };

    useEffect(() => {
        initCanvas().then((canvas) => {
            setCanvas(canvas)
        })
    }, []);

    // disable page scrolling
    useEffect(() => {
        // console.log('scroll disabled');
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);
    // canvas resize listener
    useEffect(() => {
        // console.log('resize set');
        if (canvas) {
            const resizeCanvas = () => {
                if (canvas) {
                    canvas.setWidth(canvasContainerRef.current.clientWidth);
                    canvas.setHeight(canvasContainerRef.current.clientHeight);
                    // console.log('resized');
                }
            };
            resizeCanvas();

            window.addEventListener('resize', resizeCanvas);

            return () => {
                window.removeEventListener('resize', resizeCanvas);
            };
        }
    }, [canvasContainerRef, canvas]);

    useEffect(() => {
        if (canvas) {
            canvas.on('mouse:wheel', function (opt) {
                let delta = opt.e.deltaY;
                let zoom = canvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();
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
                this.setViewportTransform(this.viewportTransform);
                this.isDragging = false;
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


    useEffect(() => {
        if (canvas) {
            // let objectIdCounter = 0;
            let history = [];
            let objectsPrev = canvas.getObjects().map(obj => fabric.util.object.clone(obj));

            canvas.on('object:added', function (event) {
                let object = event.target;
                // if (!object.id) {
                //     object.id = 'object_' + objectIdCounter++;
                // }
                objectsPrev = canvas.getObjects().map(obj => fabric.util.object.clone(obj));
                history.push({
                    action: 'object:added',
                    object: object
                });
            });
            canvas.on('object:removed', function (event) {
                let object = event.target;

                history.push({
                    action: 'object:removed',
                    object: object,
                    index: objectsPrev.indexOf(object)
                });
                objectsPrev = canvas.getObjects().map(obj => fabric.util.object.clone(obj));
            });
            canvas.on('object:modified', function (event) {
                const object = event.target;
                const index = canvas.getObjects().indexOf(object);
                const oldObj = objectsPrev[index];
                history.push({
                    action: 'object:modified',
                    object: oldObj,
                    index: index,
                });
                // console.log(`modified ${object.top} ${oldObj.top}`);
                objectsPrev = canvas.getObjects().map(obj => fabric.util.object.clone(obj));
            })

            function undo() {
                let lastChange = history.pop();
                const histLen = history.length;
                if (lastChange) {
                    const objectData = lastChange.object;
                    if (lastChange.action === 'object:removed') {
                        canvas.insertAt(objectData, lastChange.index);
                        canvas.renderAll();
                    }
                    if (lastChange.action === 'object:added') {
                        if (objectData.withPoints) {
                            canvas.remove(objectData.p1);
                            canvas.remove(objectData.p2);
                        }
                        canvas.remove(objectData);
                    }
                    if (lastChange.action === 'object:modified') {
                        canvas.remove(canvas.getObjects()[lastChange.index]);
                        canvas.insertAt(objectData, lastChange.index);
                        canvas.renderAll();
                    }
                    console.log(lastChange.action);
                }
                else
                    customAlert('history empty!', "info");
                history = history.slice(0, histLen);
            }

            document.addEventListener('keydown', function (event) {
                // customAlert(event.keyCode, 'info');
                if (
                    (event.metaKey || event.ctrlKey) &&
                    event.keyCode === 90) {
                    event.preventDefault();
                    undo();
                }
            });

        }
    }, [canvas]);


    return (
        <Grid container spacing={0} sx={{
            marginTop: 0,
            height: `calc(100vh - ${128}px)`,
        }}>
            <Grid item xs={12} style={{padding: 0}}>
                {canvas &&
                    <ToolBar canvas={canvas}/>
                }
            </Grid>
            <Grid item xs={2} sx={{padding: 0, height: '100%'}}>
                {canvas &&
                    <ProjectLayers canvas={canvas}/>
                }
            </Grid>
            <Grid ref={canvasContainerRef} item xs={8} sx={{padding: 0}}>
                <canvas style={{height: '100%', margin: '0'}} id="canvas"/>
            </Grid>
            <Grid item xs={2} sx={{padding: 0, height: '100%'}}>
                {canvas &&
                    <ProjectParams canvas={canvas}/>
                }
            </Grid>
        </Grid>
    )
}
