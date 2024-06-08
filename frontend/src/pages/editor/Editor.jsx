import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {fabric} from 'fabric';
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import Menu from "@mui/material/Menu";
import {ListItemIcon, ListItemText, MenuList, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    AddPhotoAlternateOutlined,
    ChangeHistoryOutlined,
    Edit,
    Gesture, HorizontalRuleOutlined,
    RadioButtonUncheckedOutlined
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import {EditorContext} from "./EditorContextProvider";
import {actionHandler, anchorWrapper, polygonPositionHandler} from "../../utils/EditPolygon";
import Line from "../../components/shapes/Line";
import Polygons from "../../components/shapes/Polygons";
import {formatDouble, removeShapeListeners} from "../../utils/Utils";
import {findMinMaxValues, setShapeProps} from "../../utils/CoordinatesUtils";

export function Editor({canvas}) {
    const projectSettings = useContext(EditorContext);
    const [figuresAnchorEl, setFiguresAnchorEl] = useState(null);
    const [drawingAnchorEl, setDrawingAnchorEl] = useState(null);
    const [imgPath, setImgPath] = useState('');
    const [activeButtonFromIcons, setActiveButtonFromIcons] = useState(null);
    const selectedInstrument = useRef('');
    const [disabled, setDisabled] = useState(true);
    useEffect(() => {
        if (imgPath === '') return;
        fabric.Image.fromURL(imgPath, function (img) {
            canvas.add(img);
            selectedInstrument.current = '';
            setImgPath('');
        });
    }, [imgPath]);
    useEffect(() => {
        const updatedIcons = iconButtons.map(button => {
            const activeIcon = getActiveIcon(button.key);
            return activeIcon ? { ...button, icon: activeIcon } : button;
        });
        setIconButtons(updatedIcons);
    }, [selectedInstrument.current]);
    useEffect(() => {
        if(canvas){
            const isDisabled = () => {
                const activeObjects = canvas.getActiveObjects();
                setDisabled(!(activeObjects.length === 1 && activeObjects[0].type === 'polygon'));
            }
            canvas.on('selection:created', isDisabled);
            canvas.on('selection:updated', isDisabled);
            canvas.on('selection:cleared', isDisabled);
            canvas.on('object:modified', (opt) => {
                const target = opt.target;
                if(target.type === 'polygon'){
                    let oldPoints = target.points;
                    let newPoints = [];
                    const isEllipse = target.name === 'ellipse';
                    if(!target.edit){
                       if(target.scaleX !== 1 || target.scaleY !== 1){
                           const newWidth = formatDouble(target.width * target.scaleX);
                           const newHeight = formatDouble(target.height * target.scaleY);
                           const ellipseOffset = {
                               x: (target.pathOffset.x * newWidth) / target.width,
                               y: (target.pathOffset.y * newHeight) / target.height
                           }
                           const shapeProps = {
                               width: newWidth,
                               height: newHeight,
                               scaleX: 1,
                               scaleY: 1,
                               pathOffset: isEllipse ? ellipseOffset : {x: newWidth / 2, y: newHeight / 2}
                           }
                           for (let i = 0; i < oldPoints.length; i++) {
                               newPoints.push({
                                   x: (newWidth * oldPoints[i].x) / target.width,
                                   y: (newHeight * oldPoints[i].y) / target.height
                               });
                           }
                           target.set({
                               ...shapeProps,
                               points: newPoints
                           });
                       }
                        if(target.flipX || target.flipY){
                            // oldPoints = target.points;
                            // const newPoints = [
                            //     // {x: , y: }
                            //     oldPoints[3], oldPoints[2],
                            //     oldPoints[0], oldPoints[1]
                            // ];
                            // target.set({
                            //     points: newPoints,
                            //     flipX: false,
                            //     flipY: false
                            // });
                        }
                    }
                    else{
                        if(isEllipse){
                            newPoints = oldPoints;
                        }
                        else{
                            const { minX, minY, maxX, maxY } = findMinMaxValues(oldPoints);
                            for (let i = 0; i < oldPoints.length; i++) {
                                let x = (oldPoints[i].x - minX) / (maxX - minX) * target.width;
                                let y = (oldPoints[i].y - minY) / (maxY - minY) * target.height;
                                newPoints.push({ x, y });
                            }
                        }
                        target.set({
                            points: newPoints,
                            pathOffset: isEllipse ? target.pathOffset : { x: target.width / 2, y: target.height / 2 }
                        });
                    }
                    target.setCoords();
                    console.log(opt.target)
                }
            });
        }
    }, [canvas]);
    const getActiveIcon = (key) => {
        switch (key) {
            case 'figures':
                return getActiveButtonFromActions(shapesActions)?.props.icon;
            case 'draw':
                return getActiveButtonFromActions(drawActions)?.icon;
            default:
                return null;
        }
    };
    const getActiveButtonFromActions = (actions) => {
        return actions.find(action => action.key?.toLowerCase() === selectedInstrument.current)
    };
    const changeInstrument = (name, isDrawing, selection)=> {
        removeShapeListeners(canvas.__eventListeners);
        selectedInstrument.current = name;
        canvas.selection = selection;
        canvas.isDrawingMode = isDrawing;
    };
    const handleButtonClick = (event, key, onClick) => {
        setActiveButtonFromIcons(key);
        onClick(event);
    };
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
    function createText() {
        if(selectedInstrument.current === 'text') return;
        changeInstrument('text', false, false);
        handleFiguresClose();
        let isDown, origX, origY, textBox;
        function onMouseDown(o) {
            if (textBox) return;
            isDown = true;
            const pointer = canvas.getPointer(o.e);
            origX = pointer.x;
            origY = pointer.y;
            textBox = new fabric.IText('', {
                left: origX,
                top: origY,
                fontSize: projectSettings.fontSize,
                fill: projectSettings.fillColor,
                fontFamily: projectSettings.fontFamily,
                width: 1,
                height: 1,
            });
            canvas.add(textBox);
            canvas.setActiveObject(textBox);
        }
        function onMouseMove(o) {
            if (!isDown) return;
            const pointer = canvas.getPointer(o.e);
            textBox.set({
                width: Math.abs(origX - pointer.x),
                height:  Math.abs(origY - pointer.y),
            });
            canvas.renderAll();
        }
        function onMouseUp(o) {
            isDown = false;
            changeInstrument('', false, true);
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:up', onMouseUp);
            canvas.setActiveObject(textBox)
            // textBox.on('editing:entered', function() {
            //     textBox.__skipDimension = true;
            //     console.log('Editing started');
            // });
            // textBox.on('editing:exited', function() {
            //     textBox.__skipDimension = false;
            //     console.log('Editing ended');
            // });
            // textBox.on('changed', function() {
            //     console.log('Text changed:', textBox.text);
            // });
        }
        
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
    }
    function handleAddImage() {
        changeInstrument('image', false, true);
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const filePath = URL.createObjectURL(file);
            setImgPath(filePath);
        })

        input.click();
    }
    function enablePen() {
        handleDrawClose();
        changeInstrument('pen', false, false);
    }
    function handleEnableDrawing() {
        handleDrawClose();
        changeInstrument('pencil', true, canvas.selection);
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

    const shapesActions= [
        <Polygons key={'Rectangle'} icon={<RectangleOutlinedIcon fontSize="small" />} text={'Rectangle'} canvas={canvas} handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument} changeInstrument={changeInstrument}/>,
        <Polygons key={'Polygon'} icon={<ChangeHistoryOutlined fontSize="small" />} text={'Polygon'} canvas={canvas} handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument} changeInstrument={changeInstrument}/>,
        <Polygons key={'Ellipse'} icon={<RadioButtonUncheckedOutlined fontSize="small" />} text={'Ellipse'} canvas={canvas} handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument} changeInstrument={changeInstrument}/>,
        <Line icon={<HorizontalRuleOutlined fontSize="small" />} key={'Line'} canvas={canvas} handleFiguresClose={handleFiguresClose} selectedInstrument={selectedInstrument} changeInstrument={changeInstrument}/>,
    ];
    const drawActions = [
        {icon: <Gesture  />, text: 'Pencil', func: handleEnableDrawing},
        {icon: <Edit />, text: 'Pen', func: enablePen},
    ];
    const [iconButtons, setIconButtons] = useState([
        { key: 'figures', ariaLabel: 'menu', onClick: handleFiguresClick, icon: <PermDataSettingIcon /> },
        { key: 'add-text', ariaLabel: 'add-text', onClick: createText, icon: <TextFieldsIcon /> },
        { key: 'add-image', ariaLabel: 'add-image', onClick: handleAddImage, icon: <AddPhotoAlternateOutlined /> },
        { key: 'draw', ariaLabel: 'menu', onClick: handleDrawClick, icon: <Gesture /> },
        { key: 'edit-polygon', ariaLabel: 'menu', onClick: editPolygon, icon: <Gesture /> }
    ]);

    return (
        <Toolbar variant="regular" sx={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'background.default'}}>
            <Stack direction="row" spacing={0.5}>
                {iconButtons.map(({ key, ariaLabel, onClick, icon }) => (
                    <IconButton
                        key={key}
                        edge="start"
                        color="inherit"
                        aria-label={ariaLabel}
                        onClick={(event) => handleButtonClick(event, key, onClick)}
                        disabled={key === 'edit-polygon' && disabled}
                        style={{ backgroundColor: activeButtonFromIcons === key ? 'grey' : 'initial' }}
                    >
                        {icon}
                    </IconButton>
                ))}
                <Menu
                    anchorEl={figuresAnchorEl}
                    open={Boolean(figuresAnchorEl)}
                    onClose={handleFiguresClose}
                >
                    <MenuList>
                        {shapesActions.map((item) => {
                            return item;
                        })}
                    </MenuList>
                </Menu>
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
                {/*TODO: project name*/}
                Untitled
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
