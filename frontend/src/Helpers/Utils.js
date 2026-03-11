import moment from "moment";

export const reloadWindow = () => {
    return window.location.reload();
}
export const reloadWindowToPath = (pathtoload) => {
    return window.location.href = pathtoload;
}
export const textCapitalize = (data) => {
    if (data !== undefined && data !== null && data !== "") {
        return data.charAt(0).toUpperCase() + data.slice(1);
    } else {
        return data;
    }
}
export const deleteAllCookies = () => {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}
export const getCookie = (name) => {
    let get_name = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(get_name) == 0) {
            return c.substring(get_name.length, c.length);
        }
    }

    return "";
}
export const removeCookie = (name) => {
    document.cookie = name + "=";
}
export const setCookie = (name, storevalue) => {
    document.cookie = name + "=" + storevalue + "; path=/";;
}
export const setCookieWithExpiry = (name, storevalue, expirydays) => {
    const d = new Date();
    d.setTime(d.getTime() + (expirydays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + storevalue + ";" + expires + ";path=/";
}

export const formatIST = (utcDate) =>
    new Date(utcDate + "Z").toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });