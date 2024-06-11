import React, {useEffect, useState} from 'react';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {
    FormatShapes,
    FormatShapesOutlined,
    FormatShapesSharp,
    Gesture,
    Group, GroupAddOutlined, Groups, Groups3Sharp,
    KeyboardArrowDown, ShapeLineOutlined
} from "@mui/icons-material";
import FolderIcon from '@mui/icons-material/Folder';
import Text from "../shapes/Text";
import Image from "../shapes/Image";
import {fabric} from "fabric";
import {actionHandler, anchorWrapper, polygonPositionHandler} from "../../utils/EditPolygon";
import PermDataSettingIcon from "@mui/icons-material/PermDataSetting";
import {Stack} from "@mui/material";

function IconButtons({ canvas, setObjectsSelectable, changeInstrument, setFiguresAnchorEl, setDrawingAnchorEl, lastSelectedDraw, lastSelectedTool }) {
    const [disabledEditPolygon, setDisabledEditPolygon] = useState(true);
    const [disabledGroup, setDisabledGroup] = useState(true);
    const [activeButtonFromIcons, setActiveButtonFromIcons] = useState(null);
    useEffect(() => {
        if(canvas){
            const isDisabled = () => {
                const object = canvas.getActiveObject();
                setDisabledEditPolygon(object?.type !== 'polygon');
                setDisabledGroup(object?.type !== 'activeSelection');
            }
            canvas.on('selection:created', isDisabled);
            canvas.on('selection:updated', isDisabled);
            canvas.on('selection:cleared', isDisabled);
        }
    }, [canvas]);
    const handleButtonClick = (event, key, onClick) => {
        setActiveButtonFromIcons(key);
        onClick(event);
    };
    const handleFiguresClick = (event) => {
        setFiguresAnchorEl(event.currentTarget.parentElement);
    };
    const handleDrawClick = (event) => {
        setDrawingAnchorEl(event.currentTarget.parentElement);
    };
    function editPolygon() {
        const poly = canvas.getActiveObjects()[0];
        poly.edit = !poly.edit;

        if (poly.edit) {
            var lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = 'rgba(0,0,255,0.5)';
            poly.controls = poly.points.reduce(function (acc, point, index) {
                acc['p' + index] = new fabric.Control({
                    positionHandler: polygonPositionHandler,
                    actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                    actionName: 'modifyPolygon',
                    pointIndex: index
                });
                return acc;
            }, {});
        } else {
            poly.cornerColor = 'blue';
            poly.cornerStyle = 'rect';
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
    }
    function createGroup(){
        const object = canvas.getActiveObject();
        if(object.type === 'activeSelection') {
            object.toGroup();
        }
    }
    const commonProps = {
        handleButtonClick: handleButtonClick,
        canvas: canvas,
        changeInstrument: changeInstrument,
        setObjectsSelectable: setObjectsSelectable,
        activeButtonFromIcons: activeButtonFromIcons
    };
    return (
        <Stack direction="row" spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: activeButtonFromIcons === 'shapes' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                }}}>
                <IconButton
                    aria-label="last-tool"
                    onClick={(event) => {
                        handleButtonClick(event, 'shapes', lastSelectedTool ? lastSelectedTool.onClick : handleFiguresClick);
                    }}
                >
                    {lastSelectedTool ? lastSelectedTool.icon : <PermDataSettingIcon />}
                </IconButton>
                <KeyboardArrowDown fontSize={'small'}
                                   sx={{
                                       transition: 'transform 0.2s ease-in-out',
                                       '&:hover': {
                                           transform: 'translateY(2px)',
                                           cursor: 'pointer',
                                       }
                                   }}
                                   onClick={(event) => {
                                       handleButtonClick(event, 'shapes', handleFiguresClick)
                                   }}/>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: activeButtonFromIcons === 'draws' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                }}}>
                <IconButton
                    aria-label="last-draw"
                    onClick={(event) => {
                        handleButtonClick(event, 'draws', lastSelectedDraw ? lastSelectedDraw.onClick : handleDrawClick);
                    }}
                    >
                    {lastSelectedDraw ?  lastSelectedDraw.icon : <Gesture />}
                </IconButton>
                <KeyboardArrowDown fontSize={'small'}
                                   sx={{
                                       transition: 'transform 0.2s ease-in-out',
                                       '&:hover': {
                                           transform: 'translateY(2px)',
                                           cursor: 'pointer',
                                       }
                                   }}
                                   onClick={(event) => {
                                       handleButtonClick(event, 'draws', handleDrawClick)
                                   }}/>
            </Box>
            {/*<Frame key="frame" {...commonProps} />*/}
            <Text key="add-text" {...commonProps} />
            <Image key="add-image" {...commonProps} />
            <IconButton key="edit-polygon" aria-label="menu" disabled={disabledEditPolygon} onClick={(event) => handleButtonClick(event, 'edit-polygon', editPolygon)} sx={{ backgroundColor: activeButtonFromIcons === 'edit-polygon' ? 'rgba(255, 255, 255, 0.15)' : 'transparent' }}><FormatShapes /></IconButton>
            <IconButton key="group" aria-label="create-group" disabled={disabledGroup} onClick={(event) => handleButtonClick(event, 'group', createGroup)} sx={{ backgroundColor: activeButtonFromIcons === 'group' ? 'rgba(255, 255, 255, 0.15)' : 'transparent' }}><Groups  /></IconButton>
        </Stack>
    );
}

export default IconButtons;