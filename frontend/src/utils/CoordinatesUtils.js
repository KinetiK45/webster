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