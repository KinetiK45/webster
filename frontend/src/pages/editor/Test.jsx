import React, {useEffect, useState} from 'react';
import { fabric } from 'fabric';

export function Test() {
    const [canvas, setCanvas] = useState('');
    useEffect(() => {
        setCanvas(initCanvas());
    }, []);

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

        rect.set('selectable', true);

        canvas.add(rect);
    }

    function createCircle() {
        const text = new fabric.Text('Hello', {
            left: 100,
            top: 130,
            fontSize: 16,
            fill: 'white'
        });
        canvas.add(text);
    }

    function saveCanvas() {
        const json = canvas.toJSON();
        console.log(json);
    }


    return(
        <div>
            <button onClick={createRect} >Rect</button>
            <button onClick={createCircle} >Circle</button>
            <button onClick={saveCanvas}>Save</button>
            <h1>Fabric.js on React - fabric.Canvas('...')</h1>
            <canvas id="canvas" />
        </div>
    );
}
