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
import {AddPhotoAlternateOutlined, PanTool, Rectangle, RectangleOutlined, Settings} from "@mui/icons-material";
import Button from "@mui/material/Button";

function MenuIcon() {
    return null;
}

export function Test() {
    const [canvas, setCanvas] = useState('');
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
