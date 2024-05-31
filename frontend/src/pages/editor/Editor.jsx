import React, {useContext, useEffect, useState} from 'react';
import {fabric} from 'fabric';
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import Menu from "@mui/material/Menu";
import {ListItemIcon, ListItemText, MenuList, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    AddPhotoAlternateOutlined,
    ChangeHistoryOutlined,
    Edit,
    Gesture,
    HexagonOutlined,
    HorizontalRuleOutlined,
    RadioButtonUncheckedOutlined,
    TimelineOutlined
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import {EditorContext} from "./EditorContextProvider";

export function Editor({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const [imgPath, setImgPath] = useState('');

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

    function createPolygon() {
        const points = [
            { x: 100, y: 100 },
            { x: 150, y: 50 },
            { x: 200, y: 100 },
            { x: 150, y: 150}
        ];

        const polygon = new fabric.Polygon(points, {
            fill: 'green',
            selectable: true
        });

        canvas.add(polygon);
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
    function createText() {
        const text = new fabric.Textbox('Hello', {
            left: 100,
            top: 130,
            fontSize: projectSettings.fontSize,
            fill: projectSettings.fillColor,
            fontFamily: projectSettings.fontFamily,
        });
        canvas.add(text);
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
        canvas.isDrawingMode = !canvas.isDrawingMode;
    }
    function createLine() {
        let drawingLine = null;
        let isDrawing = false;
        canvas.selection = false;
        function handleMouseDown(o) {
            isDrawing = true;
            const pointer = canvas.getPointer(o.e);
            const points = [pointer.x, pointer.y, pointer.x, pointer.y];
            drawingLine = new fabric.Line(points, {
                strokeWidth: 2,
                fill: 'black',
                stroke: 'black',
                originX: 'center',
                originY: 'center',
                perPixelTargetFind: true,
                selectable: false
            });
        }
        function handleMouseMove(o) {
            if (!isDrawing) return;
            if((drawingLine.x1 !== drawingLine.x2 || drawingLine.y1 !== drawingLine.y2) && !canvas.contains(drawingLine))
                canvas.add(drawingLine);
            const pointer = canvas.getPointer(o.e);
            drawingLine.set({ x2: pointer.x, y2: pointer.y });
            canvas.renderAll();
        }
        function handleMouseUp(o) {
            if (!isDrawing) return;
            canvas.selection = true;
            isDrawing = false;
            drawingLine.setCoords();
            if(drawingLine.x1 === drawingLine.x2 && drawingLine.y1 === drawingLine.y2){
                drawingLine = null;
                return;
            }
            addEndPoints();
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
        }
        function addEndPoints() {
            const p1 = new fabric.Circle({
                left: drawingLine.x1,
                top: drawingLine.y1,
                radius: 3,
                fill: 'white',
                hasControls: false,
                hasBorders: false,
                selectable: true,
                originX: 'center',
                originY: 'center',
                strokeWidth: 0,
                hoverCursor: 'move',
                visible: false,
                linePoint: true,
                needToHide: true
            });
            const p2 = new fabric.Circle({
                left: drawingLine.x2,
                top: drawingLine.y2,
                radius: 3,
                fill: 'white',
                hasControls: false,
                hasBorders: false,
                selectable: true,
                originX: 'center',
                originY: 'center',
                strokeWidth: 0,
                hoverCursor: 'move',
                visible: false,
                linePoint: true,
                needToHide: true
            });
            drawingLine.p1 = p1;
            drawingLine.p2 = p2;
            drawingLine.withPoints = true;

            p1.on('moving', function(o) {
                const { left, top } = p1;
                drawingLine.set({ x1: left, y1: top });
                drawingLine.setCoords();
                canvas.renderAll();
            });

            p2.on('moving', function(o) {
                const { left, top } = p2;
                drawingLine.set({ x2: left, y2: top });
                drawingLine.setCoords();
                canvas.renderAll();
            });

            canvas.add(p1);
            canvas.add(p2);
            canvas.renderAll();
        }
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        handleFiguresClose();

    }
    function polygonPositionHandler(dim, finalMatrix, fabricObject) {
        var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
            y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
        return fabric.util.transformPoint(
            { x: x, y: y },
            fabric.util.multiplyTransformMatrices(
                fabricObject.canvas.viewportTransform,
                fabricObject.calcTransformMatrix()
            )
        );
    }
    function getObjectSizeWithStroke(object) {
        var stroke = new fabric.Point(
            object.strokeUniform ? 1 / object.scaleX : 1,
            object.strokeUniform ? 1 / object.scaleY : 1
        ).multiply(object.strokeWidth);
        return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
    }
    function actionHandler(eventData, transform, x, y) {
        var polygon = transform.target,
            currentControl = polygon.controls[polygon.__corner],
            mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
            polygonBaseSize = getObjectSizeWithStroke(polygon),
            size = polygon._getTransformedDimensions(0, 0),
            finalPointPosition = {
                x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
            };
        polygon.points[currentControl.pointIndex] = finalPointPosition;
        return true;
    }
    function anchorWrapper(anchorIndex, fn) {
        return function(eventData, transform, x, y) {
            var fabricObject = transform.target,
                absolutePoint = fabric.util.transformPoint({
                    x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                    y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                }, fabricObject.calcTransformMatrix()),
                actionPerformed = fn(eventData, transform, x, y),
                newDim = fabricObject._setPositionDimensions({}),
                polygonBaseSize = getObjectSizeWithStroke(fabricObject),
                newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
            fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
            return actionPerformed;
        }
    }
    function editPolygon() {
        const poly = canvas.getActiveObjects()[0];
        poly.edit = !poly.edit;

        if (poly.edit) {
            var lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = 'rgba(0,0,255,0.5)';
            poly.controls = poly.points.reduce(function(acc, point, index) {
                acc['p' + index] = new fabric.Control({
                        positionHandler: polygonPositionHandler,
                        actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                        actionName: 'modifyPolygon',
                        pointIndex: index
                });
                return acc;
            }, { });
        } else {
            poly.cornerColor = 'blue';
            poly.cornerStyle = 'rect';
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
    }
    const isDisabled = () => {
        if (!canvas) return true;
        const objects = canvas.getActiveObjects();
        return !(objects.length === 1 && objects[0].type === 'polygon');
    };
    function addFigure(name) {
        canvas.selection= false;
        handleFiguresClose();
        let startX, startY;
        let figure = null;
        const polyOptions = {
            left: startX,
            top: startY,
            fill: 'red',
            selectable: true,
            objectCaching: false,
        };
        function removeListeners() {
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:up', onMouseUp);
        }
        function onMouseDown(options) {
            const pointer = canvas.getPointer(options.e);
            startX = pointer.x;
            startY = pointer.y;
            figure = new fabric.Polygon([], polyOptions);
            canvas.add(figure);
        }

        function onMouseMove(options) {
            if (!figure) return;

            const pointer = canvas.getPointer(options.e);
            const width = Math.abs(startX - pointer.x);
            const height = Math.abs(startY - pointer.y);

            switch (name) {
                case 'rect':
                    figure.set({
                        points:[
                            {x: 0, y: 0},
                            {x: width, y: 0},
                            {x: width, y: height},
                            {x: 0, y: height},
                        ],
                        left: Math.min(pointer.x, startX),
                        top: Math.min(pointer.y, startY),
                    });
                    break;

                case 'triangle':
                    figure.set({
                        points: [
                            { x: width / 2, y: 0 },
                            { x: width, y: height },
                            { x: 0, y: height }
                        ],
                        left: Math.min(pointer.x, startX),
                        top: Math.min(pointer.y, startY),
                    });
                    break;

                case 'ellipse':
                    const rx = Math.abs((startX - pointer.x) / 2);
                    const ry = Math.abs((startY - pointer.y) / 2)
                    const ellipsePoints = [];
                    for (let i = 0; i < 50; i++) {
                        const angle = (i * 2 * Math.PI) / 50;
                        ellipsePoints.push({
                            x: rx * Math.cos(angle),
                            y: ry * Math.sin(angle)
                        });
                    }
                    figure.set({
                        points: ellipsePoints,
                        width: width,
                        height: height,
                        left: Math.min(pointer.x, startX),
                        top: Math.min(pointer.y, startY),
                    });
                    break;
                default:
                    throw new Error('Непідтримувана фігура: ' + name);
            }
            canvas.renderAll();
        }

        function onMouseUp(options) {
            if(!figure) return
            removeListeners();
            const pointer = canvas.getPointer(options.e);
            const width = Math.abs(startX - pointer.x);
            const height = Math.abs(startY - pointer.y);
            if(name !== 'ellipse'){
                figure.set({
                    width: width,
                    height: height,
                    pathOffset: {x: width / 2, y: height / 2}
                });
            }
            figure.setCoords();
            canvas.selection = true;
            figure = null;
        }

        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);

    }

    const figuresActions = [
        {icon: <RectangleOutlinedIcon fontSize="small" />, text: 'Rect', func: () => {addFigure('rect')}},
        {icon: <ChangeHistoryOutlined fontSize="small" />, text: 'Triangle', func: () => addFigure('triangle')},
        {icon: <HorizontalRuleOutlined fontSize="small" />, text: 'Line', func: createLine},
        {icon: <TimelineOutlined fontSize="small" />, text: 'Polyline', func: createPolyline},
        {icon: <HexagonOutlined fontSize="small" />, text: 'Polygon', func: createPolygon},
        {icon: <RadioButtonUncheckedOutlined fontSize="small" />, text: 'Ellipse', func: () => addFigure('ellipse')},
    ];
    const drawActions = [
        {icon: <Edit fontSize="small" />, text: 'Pen', func: handleEnableDrawing},
        {icon: <Edit fontSize="small" />, text: 'Pencil', func: handleEnableDrawing},
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
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={editPolygon}
                    disabled={isDisabled()}
                >
                    <Gesture/>
                </IconButton>
                <Menu
                    anchorEl={drawingAnchorEl}
                    open={Boolean(drawingAnchorEl)}
                    onClose={handleDrawClose}
                >
                    <MenuList>
                        {drawActions.map((item) => {
                            return <MenuItem key={item.text} onClick={item.func}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText>{item.text}</ListItemText>
                            </MenuItem>
                        })}
                    </MenuList>
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
