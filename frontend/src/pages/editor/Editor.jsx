import React, {useEffect, useState} from 'react';
import {fabric} from 'fabric';
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import Menu from "@mui/material/Menu";
import {Divider, ListItemIcon, ListItemText, MenuList, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {AddPhotoAlternateOutlined, Gesture} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";

export function Editor({canvas}) {
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const [imgPath, setImgPath] = useState('');
    const [isDrawingMode, setIsDrawingMode] = useState(false);

    useEffect(() => {
        if (imgPath === '') return;
        fabric.Image.fromURL(imgPath, function (img) {
            canvas.add(img);
            setImgPath('');
        });
    }, [imgPath]);

    const handleFiguresClick = (event) => {
        setFiguresAnchorEl(event.currentTarget);
    };

    const handleFiguresClose = () => {
        setFiguresAnchorEl(null);
    };

    const handleDrawClick = (event) => {
        setDrawingAnchorEl(event.currentTarget);
    };

    const handleDrawClose = () => {
        setDrawingAnchorEl(null);
    };

    useEffect(() => {
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
        }
    }, [canvas]);
    const initCanvas = () => {
        const containerWidth = document.getElementById('canvas').clientWidth;
        const containerHeight = document.getElementById('canvas').clientHeight;
        return new fabric.Canvas('canvas', {
            width: containerWidth,
            height: containerHeight,
            backgroundColor: 'pink',
            selectable: true,
        });
    };

    function createRect() {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 20,
            height: 20,
            selectable: true,
        });
        canvas.add(rect);
        handleFiguresClose();
    }
    function createTriangle() {
        const triangle = new fabric.Triangle({
            left: 100,
            top: 100,
            fill: 'blue',
            width: 20,
            height: 30,
            selectable: true
        });
        canvas.add(triangle);
        handleFiguresClose();
    }
    function createPolygon() {
        const points = [
            { x: 100, y: 100 },
            { x: 150, y: 50 },
            { x: 200, y: 100 },
            { x: 150, y: 150 }
        ];

        const polygon = new fabric.Polygon(points, {
            fill: 'green',
            selectable: true
        });

        canvas.add(polygon);
        handleFiguresClose();
    }
    function createLine() {
        canvas.add(new fabric.Line([50, 100, 200, 200], {
            left: 170,
            top: 150,
            stroke: 'red',
        }));
        handleFiguresClose();
    }
    function createPolyline() {
        const points = [
            { x: 50, y: 100 },
            { x: 150, y: 200 },
            { x: 250, y: 150 },
            { x: 350, y: 200 }
        ];

        const polyline = new fabric.Polyline(points, {
            left: 170,
            top: 150,
            stroke: 'blue',
            fill: 'transparent',
            strokeWidth: 2
        });

        canvas.add(polyline);
        handleFiguresClose();
    }
    function createCircle() {
        const circle = new fabric.Circle({
            left: 100,
            top: 130,
            radius: 20,
            fill: 'red',
        });
        canvas.add(circle);
        handleFiguresClose();
    }
    function createText() {
        const text = new fabric.IText('Hello', {
            left: 100,
            top: 130,
            fontSize: 16,
            fill: 'white',
        });
        canvas.add(text);
        handleFiguresClose();
    }
    function createEllipse() {
        const ellipse = new fabric.Ellipse({
            left: 100,
            top: 100,
            fill: 'orange',
            rx: 50,
            ry: 30,
            selectable: true
        });

        canvas.add(ellipse);
        handleFiguresClose();
    }
    function saveCanvas() {
        const json = canvas.toJSON();
        console.log(json);
    }
    function handleAddImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const filePath = URL.createObjectURL(file);
            setImgPath(filePath);
        })

        input.click();
    }
    function handleEnableDrawing() {
        handleDrawClose();
        // if(canvas.isDrawingMode) {
        //     canvas.isDrawingMode = false
        //     return
        // }
        canvas.isDrawingMode = !canvas.isDrawingMode
    }

    const figuresActions = [
        {icon: <RectangleOutlinedIcon fontSize="small" />, text: 'Rect', func: createRect},
        {icon: <CircleOutlinedIcon fontSize="small" />, text: 'Circle', func: createCircle},
        {icon: <RemoveOutlinedIcon fontSize="small" />, text: 'Line', func: createLine}
    ];

    return (
        <Toolbar variant="regular" sx={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'background.default'}}>
            <Stack direction="row" spacing={0.5}>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleFiguresClick}
                >
                    <PermDataSettingIcon/>
                </IconButton>
                <Menu
                    anchorEl={figuresAnchorEl}
                    open={Boolean(figuresAnchorEl)}
                    onClose={handleFiguresClose}
                >
                    <MenuList>
                        {figuresActions.map((item) => {
                            return <MenuItem key={item.text} onClick={item.func}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText>{item.text}</ListItemText>
                            </MenuItem>
                        })}
                    </MenuList>
                </Menu>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="add-image"
                    onClick={createText}
                >
                    <TextFieldsIcon/>
                </IconButton>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="add-image"
                    onClick={handleAddImage}
                >
                    <AddPhotoAlternateOutlined/>
                </IconButton>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleDrawClick}
                >
                    <Gesture/>
                </IconButton>
                <Menu
                    anchorEl={drawingAnchorEl}
                    open={Boolean(drawingAnchorEl)}
                    onClose={handleDrawClose}
                >
                    <MenuItem onClick={handleEnableDrawing}>Pen</MenuItem>
                    <MenuItem onClick={handleEnableDrawing}>Pencil</MenuItem>
                </Menu>
            </Stack>
            <Typography>
                Proj name
            </Typography>
            <Stack spacing={1} direction="row" sx={{display: 'flex', alignItems: 'center'}}>
                <Avatar alt="Avatar" />
                <Typography>
                    Creator Name
                </Typography>
            </Stack>
        </Toolbar>
    );
}
