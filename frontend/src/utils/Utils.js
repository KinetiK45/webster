import Requests from "../api/Requests";
import {enqueueSnackbar} from "notistack";

export function hexToRgba(hex, alpha = 1) {
    const hexColor = hex.replace(/^#/, '');
    const bigint = parseInt(hexColor, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const rgbaToHex = (rgba) => {
    const match = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
    if (match) {
        const [r, g, b, a = 1] = match.slice(1, 5).map(Number);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        return [hex, a];
    }
    return ['#000000', 1];
};



export async function logout(){
    localStorage.removeItem('user_id');
    const resp = await Requests.logout();
    if (resp.state === true){
        window.location.href = '/auth/login';
    }
}

export function customAlert(text, variant = 'info') {
    if (typeof text !== 'string')
        text = text.toString();
    enqueueSnackbar(text, { variant, anchorOrigin: {horizontal: "right", vertical: 'bottom'} });
}

export function formatDateRecent(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // разница в секундах

    let options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    };

    if (diff < 60 * 60) {
        const minutes = Math.floor(diff / 60);
        if (minutes < 1){
            return `${diff} sec. ago`;
        }
        return `${minutes} min. ago`;
    } else if (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    ) {
        options = {
            hour: 'numeric',
            minute: 'numeric',
        };
    }
    return date.toLocaleString(undefined, options);
}

export function formatDate(dateString, minutes = false) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    if (!minutes)
        return `${day} ${month} ${year}`;
    return `${day} ${month} ${year} in ${date.toLocaleTimeString('en-GB', {hour: "numeric", minute: "numeric"})}`;
}

export function formatDouble(number = 0){
    return parseFloat(number.toFixed(2));
}

function getListenerIndex(array, name) {
    return array.findIndex(item => item.name === name);
}

export function removeShapeListeners(listeners) {
    const eventTypes = ['mouse:down', 'mouse:move', 'mouse:up'];
    const listenerNames = ['createShape', 'changeShape', 'endShape'];

    eventTypes.forEach((eventType, index) => {
        const listenerArray = listeners[eventType];
        const listenerIndex = getListenerIndex(listenerArray, listenerNames[index]);

        if (listenerIndex > -1) {
            listenerArray.splice(listenerIndex, 1);
        }
    });
}

export function applyPropertyToText(activeObject, key, input){
    if (activeObject.type === 'activeSelection') {
        activeObject.getObjects().forEach(obj => {
            if(obj.type === 'i-text'){
                obj.set(key, input);
            }
        });
    } else {
        activeObject.set(key, input);
    }
}