
export function getOffsets(canvas, opt, startX, startY) {
    const pointer = canvas.getPointer(opt.e);
    const offsetX = pointer.x - startX;
    const offsetY = pointer.y - startY;
    return {offsetX, offsetY};
}

export function getPointerStart(canvas, opt) {
    const pointer = canvas.getPointer(opt.e);
    const startX = pointer.x;
    const startY = pointer.y;
    return { startX , startY };
}

export function setPointsCoordinates(line, offsetX, offsetY){
    line.p1.set({
        left: line.p1.left + offsetX,
        top: line.p1.top + offsetY
    });
    line.p2.set({
        left: line.p2.left + offsetX,
        top: line.p2.top + offsetY
    });
    line.p1.setCoords();
    line.p2.setCoords();
}

export function setLineCoordinates(line) {
    line.set({
        x1: line.p1.left,
        x2: line.p2.left,
        y1: line.p1.top,
        y2: line.p2.top,
    });
    line.setCoords();
}

export function findMaxValue(points) {
    let maxValue = -Infinity;

    for (let i = 0; i < points.length; i++) {
        if (points[i].x > maxValue) {
            maxValue = points[i].x;
        }
        if (points[i].y > maxValue) {
            maxValue = points[i].y;
        }
    }

    return maxValue;
}

export function getEllipsePoints(rx, ry){
    const ellipsePoints = [];
    for (let i = 0; i < 50; i++) {
        const angle = (i * 2 * Math.PI) / 50;
        ellipsePoints.push({
            x: rx * Math.cos(angle),
            y: ry * Math.sin(angle)
        });
    }
    return ellipsePoints;
}

export function setRectangleProps(shape, startProps, width, height){
    shape.set({
        ...startProps,
        points: [
            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: width, y: height },
            { x: 0, y: height },
        ],
    });
}

export function setPolygonProps(shape, startProps, width, height){
    shape.set({
        ...startProps,
        points: [
            { x: width / 2, y: 0 },
            { x: width, y: height },
            { x: 0, y: height }
        ],
    });
}

export function setShapeProps(name, shape, shapesProps, width, height) {
    switch (name) {
        case 'rectangle':
            setRectangleProps(shape, shapesProps, width, height);
            break;
        case 'polygon':
            setPolygonProps(shape, shapesProps, width, height);
            break;
        case 'ellipse':
            shape.set({
                ...shapesProps,
                points: getEllipsePoints(width / 2, height / 2),
            });
            break;
        default:
            throw new Error('Непідтримувана фігура: ' + shape.name);
    }
}

export function findMinMaxValues(points) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < points.length; i++) {
        if (points[i].x < minX) {
            minX = points[i].x;
        }
        if (points[i].y < minY) {
            minY = points[i].y;
        }
        if (points[i].x > maxX) {
            maxX = points[i].x;
        }
        if (points[i].y > maxY) {
            maxY = points[i].y;
        }
    }

    return { minX, minY, maxX, maxY };
}

export function handleEditedPolygon(target) {
    let oldPoints = target.points;
    let newPoints = [];
    const isEllipse = target.name === 'ellipse';
    if(target.edit) {
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
        target.setCoords();
    }
}