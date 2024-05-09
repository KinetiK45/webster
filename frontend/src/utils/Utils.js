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

export async function logout(){
    localStorage.removeItem('user_id');
    const resp = await Requests.logout();
    if (resp.state === true){
        window.location.href = '/auth/login';
    }
    else
        alert(`logout error ${JSON.stringify(resp)}`)
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
            return 'now';
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

