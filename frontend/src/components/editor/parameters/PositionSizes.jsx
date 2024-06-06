import {Grid, TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import {customAlert, formatDouble} from "../../../utils/Utils";
import {EditorContext} from "../../../pages/editor/EditorContextProvider";
import Typography from "@mui/material/Typography";

function PositionSizes({canvas}) {
    const [w, setW] = useState(0);
    const [h, setH] = useState(0);

    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

    useEffect(() => {
        if (canvas) {
            const onObjectSelected = () => {
                const activeObject = canvas.getActiveObject();
                setW(formatDouble(activeObject.width * activeObject.scaleX));
                setH(formatDouble(activeObject.height * activeObject.scaleY));
                setLeft(formatDouble(activeObject.left));
                setTop(formatDouble(activeObject.top));
            };

            const onMove = () => {
                const activeObject = canvas.getActiveObject();
                setLeft(formatDouble(activeObject.left));
                setTop(formatDouble(activeObject.top));
            }

            canvas.on('selection:created', onObjectSelected);
            canvas.on('selection:updated', onObjectSelected);
            canvas.on('object:scaling', onObjectSelected);
            canvas.on('object:moving', onMove);

            return () => {
                canvas.off('selection:created', onObjectSelected);
                canvas.off('selection:updated', onObjectSelected);
                canvas.off('object:scaling', onObjectSelected);
                canvas.off('object:moving', onMove);
            };
        }
    }, [canvas]);

    return (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <Typography>W: {w}px</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>H: {h}px</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>L: {left}px</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>T: {top}px</Typography>
            </Grid>
        </Grid>
    )
}

export default PositionSizes;