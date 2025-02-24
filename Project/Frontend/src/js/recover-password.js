import { router } from "./app.js";

document.addEventListener('DOMContentLoaded', () => {
    initRecoverPassword();
});

export async function initRecoverPassword(params = {}) {
    const host = window.location.host;
    const apiBaseUrl = `https://${host}/api/`;

    

}

function showMessage(message, type) {
    const prefix = type === "success" ? "Success: " : "Error: ";
    alert(`${prefix}${message}`);
    history.pushState(null, null, "/");
    router();
}

