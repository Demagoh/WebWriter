/// Imports
import {WebSocketManager} from "./WebSocketManager.js";
import {loginFormHandler, loginForm} from "./login.js";



/// Login
let cookies = document.cookie.split(";");
for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].trim().split("=");
}

let loggedIn = false;
for (let i = 0; i < cookies.length; i++) {
    if (cookies[i][0] === "webwriter") {
        loggedIn = true;
    }
};

if (!loggedIn) {
    loginFormHandler(requestServer);
}



/// WebSocket

let serverConnection = new WebSocketManager("wss://ws.demagoh.com/", handleServerResponse, handleUpdate);

function handleUpdate(status) {
    switch (status) {
        case "connected":
            requestServer({
                request : "echo",
                data : {
                    text : "test"
                }
            });
            break;
    }
}



/// Communication handling
/**
 * Function for sending request data to the API.
 */
function requestServer(data) {
    serverConnection.sendMessage(data);
}

/**
 * Function for handling API responses.
 */
function handleServerResponse(message) {
    let fullResponse = JSON.parse(atob(message.data));
    let serverResponse = JSON.parse(fullResponse.response);

    if (serverResponse.status === "successful") {
        switch(fullResponse.for) {
            case "echo":
                console.log(serverResponse.response.text);
                break;
            case "login":
                if (serverResponse.response.status === "error") {
                    // console.error(serverResponse.response.reason);
                    loginForm.errorField.innerHTML = serverResponse.response.reason;
                } else {
                    // console.log(serverResponse.response.userID);
                    document.cookie = ("webwriter=" + serverResponse.response.cookieValue);
                }
                break;
            default:
                console.log(serverResponse);
        }
    } else {
        console.error(serverResponse.response.reason);
    }
}