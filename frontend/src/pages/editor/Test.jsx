import React, {useEffect, useState} from 'react';
import { fabric } from 'fabric';
import { Grid } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import {AddPhotoAlternateOutlined, PanTool, Rectangle, RectangleOutlined, Settings,Gesture} from "@mui/icons-material";
import Button from "@mui/material/Button";
function MenuIcon() {
    return null;
}

export function Test() {
    const [canvas, setCanvas] = useState(null);
    const [isDrawingMode,setIsDrawingMode] = useState(false)
    useEffect(() => {
        setCanvas(initCanvas());

    }, []);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const initCanvas = () => (
        new fabric.Canvas('canvas', {
            height: 300,
            width: 400,
            backgroundColor: 'pink',
            selectable: true
        })
    )
    useEffect(() => {
        if (canvas) {
            canvas.on('mouse:wheel', function(opt) {
                var delta = opt.e.deltaY;
                var zoom = canvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
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
                }})
            canvas.on('mouse:down', function(opt) {
                var evt = opt.e;
                if (evt.altKey === true) {
                    this.isDragging = true;
                    this.selection = false;
                    this.lastPosX = evt.clientX;
                    this.lastPosY = evt.clientY;
                }
            });
            canvas.on('mouse:move', function(opt) {
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
            canvas.on('mouse:up', function(opt) {
                // on mouse up we want to recalculate new interaction
                // for all objects, so we call setViewportTransform
                this.setViewportTransform(this.viewportTransform);
                this.isDragging = false;
                this.selection = true;
            });
        }
    }, [canvas]);

    function createRect() {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 20,
            height: 20,
            selectable: true
        });
        canvas.add(rect);
        handleClose();
    }

    function createCircle() {
        const circle = new fabric.Circle({
            left: 100,
            top: 130,
            radius: 20,
            fill: 'red',
        });
        canvas.add(circle);
        handleClose();
    }

    function createText() {
        const text = new fabric.Text('Hello', {
            left: 100,
            top: 130,
            fontSize: 16,
            fill: 'white'
        });
        canvas.add(text);
        handleClose();
    }
    function selectObject(index) {
        const object = canvas.getObjects()[index];
        canvas.setActiveObject(object);
        canvas.renderAll();
    }
    function saveCanvas() {
        const json = canvas.toJSON();
        console.log(json);
    }
    function handleAddImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const filePath = URL.createObjectURL(file);
            console.log(filePath);
            fabric.Image.fromURL(filePath, function(img) {
                canvas.add(img);
            });
        })

        input.click();
    }
    function handleEnableDrawing() {
        if(canvas.isDrawingMode) {
            canvas.isDrawingMode = false
            setIsDrawingMode(false)
            return
        }
        canvas.isDrawingMode = true
        setIsDrawingMode(true)
    }

    return (
        <Grid container spacing={2} style={{marginTop: 0}}>
            <Grid item xs={12} style={{paddingTop: 0}}>
                <Toolbar style={{backgroundColor: '#657B81'}}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleClick}
                    >
                        <RectangleOutlined />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={createRect}>Rectangle</MenuItem>
                        <MenuItem onClick={createCircle}>Circle</MenuItem>
                        <MenuItem onClick={createText}>Text</MenuItem>
                    </Menu>


                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="add-image"
                        onClick={handleAddImage}
                    >
                        <AddPhotoAlternateOutlined />
                    </IconButton>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="add-image"
                        onClick={handleEnableDrawing}
                    >
                        <Gesture />
                    </IconButton>

                </Toolbar>
            </Grid>

            <Grid item xs={1} style={{padding: 0}}>
                <Box style={{backgroundColor: '#1F2833', width: '100%', height: '100%'}}>
                    {canvas && canvas.getObjects().map((item, index) => (
                        <Button onClick={() => {selectObject(index)}} key={index} variant="outlinad" style={{width: '100%', display: 'block'}}>
                            {item.type} {index}
                        </Button>
                    ))}
                </Box>
            </Grid>

            <Grid item xs={10} style={{padding: 0}}>
                <canvas id="canvas" style={{width: '100%', height: '100%'}}></canvas>
            </Grid>

            <Grid item xs={1} style={{padding: 0}} >
                <Box style={{backgroundColor: '#1F2833', width: '100%', height: '100%'}}>
                </Box>
            </Grid>
        </Grid>
    );
}
