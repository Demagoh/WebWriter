/// Imports
import {WebSocketManager} from "./WebSocketManager.js";
import {loginFormHandler, loginForm} from "./login.js";
import {navigation, navigationHandler} from "./navigation.js";



/// Variables
let statusDisplay = document.getElementById("statusDisplay");
let isConnected = false;
let gotDataAt = -1;



/// Login
let userData = {
    ID : null,
    username : null
}

let cookies = document.cookie.split(";");
for (let i = 0; i < cookies.length; i++) {
    cookies[i] = cookies[i].trim().split("=");
}

let loggedIn = -1;
for (let i = 0; i < cookies.length; i++) {
    if (cookies[i][0] === "webwriter") {
        loggedIn = i;
    }
};

if (loggedIn === -1) {
    loginFormHandler(requestServer);
} else {
    navigationHandler(logoutUser);
}

/**
 * Function for logging out the user.
 */
function logoutUser() {
    document.cookie = ("webwriter=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC");
    window.location.reload();
}



/// WebSocket
let serverConnection = null;

console.info("Loading page...");

window.onload = () => {
    console.info("Page loaded.");

    statusDisplay.innerHTML = 'Connecting to the server<span class="animatedDots"></span>';

    serverConnection = new WebSocketManager(
        "wss://ws.demagoh.com/",
        handleServerResponse,
        handleUpdate
    );
}

function handleUpdate(status, reconnectAttempt = 0) {
    switch (status) {
        case "registered":
            /* requestServer({
                request : "echo",
                data : {
                    text : "test"
                }
            }); */

            statusDisplay.style.display = "fixed";
            statusDisplay.innerHTML = 'Connected to the server!';
            isConnected = true;
            
            if (loggedIn !== -1) {
                statusDisplay.innerHTML = 'Getting user data<span class="animatedDots"></span>';
                requestServer({
                    request : "user/data",
                    data : {
                        cookie : cookies[loggedIn][1]
                    }
                });
            }
            break;
        case "failed":
            statusDisplay.style.display = "fixed";
            statusDisplay.classList.add("error");
            statusDisplay.innerHTML = 'Failed to connect to the server.';
            break;
        case "reconnecting":
            statusDisplay.style.display = "fixed";
            statusDisplay.innerHTML = 'Lost connection to the server, reconnecting (attempt #' + reconnectAttempt + ')<span class="animatedDots"></span>'
            break;
        case "abandoned":
            statusDisplay.style.display = "fixed";
            statusDisplay.classList.add("error");
            statusDisplay.innerHTML = 'Failed to reconnect to the server. Abandoning further connection attempts.';
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
        let forRequest = fullResponse.for.split("/");
        switch (forRequest[0]) {
            case "echo":
                console.log(serverResponse.response.text);
                break;
            case "login":
                if (serverResponse.response.status === "error") {
                    // console.error(serverResponse.response.reason);
                    loginForm.errorField.innerHTML = serverResponse.response.reason;

                    loginForm.usernameInput.classList.add("invalid");
                    loginForm.previousUsernameValue = loginForm.usernameInput.value;
                    loginForm.passwordInput.classList.add("invalid");
                    loginForm.previousPasswordValue = loginForm.passwordInput.value;

                    loginForm.submitButton.classList.remove("validInputs");
                } else {
                    let timeToExpire = new Date();
                    timeToExpire.setTime(timeToExpire.getTime() + 31536000000);
                    timeToExpire = timeToExpire.toUTCString();
                    document.cookie = ("webwriter=" + serverResponse.response.cookieValue +
                        "; Path=/" +
                        "; Expires=" + timeToExpire);
                    window.location.reload();
                }
                break;
            case "user":
                if (forRequest[1] !== undefined && forRequest[1] !== "") {
                    switch (forRequest[1]) {
                        case "data":
                            userData.ID = serverResponse.response.userID;
                            userData.username = serverResponse.response.username;

                            navigation.profileUsername.innerHTML = userData.username;

                            statusDisplay.innerHTML = "Received user data!";
                            gotDataAt = new Date().getTime();

                            // there's no point in getting the user data from the server every time
                            // the WebSocket reconnects
                            loggedIn = -1;

                            // console.log(userData);
                            break;
                        default:
                            console.log(serverResponse);
                    }
                } else {
                    console.log(serverResponse.response.reason);
                }
                break;
            default:
                console.log(serverResponse);
        }
    } else {
        console.error(serverResponse.response.reason);
    }
}

setInterval(() => {
    if (gotDataAt !== -1) {
        if (new Date().getTime() - gotDataAt > 2000) {
            gotDataAt = -1;
            statusDisplay.style.display = "none";
        }
    }
}, 50);