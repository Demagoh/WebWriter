/// Imports
import {WebSocketManager} from "./WebSocketManager.js";
import {loginFormHandler, loginForm} from "./login.js";
import {navigation, navigationHandler} from "./navigation.js";



/// Variables
let statusDisplay = document.getElementById("statusDisplay");
let isConnected = false;
let isDisplayingDisconnected = false;
let isActive = true;
let gotDataAt = -1;
let lastActivity = new Date().getTime();
const originalPageTitle = document.title;



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

            statusDisplay.style.display = "initial";
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
            statusDisplay.style.display = "initial";
            statusDisplay.classList.add("error");
            statusDisplay.innerHTML = 'Failed to connect to the server.';
            isConnected = false;
            break;
        case "reconnecting":
            statusDisplay.style.display = "initial";
            statusDisplay.innerHTML = 'Lost connection to the server, reconnecting (attempt #'
                + reconnectAttempt + ')<span class="animatedDots"></span>'
            isConnected = false;
            break;
        case "abandoned":
            statusDisplay.style.display = "initial";
            statusDisplay.classList.add("error");
            statusDisplay.innerHTML = 'Failed to reconnect to the server. Abandoning further' +
                ' connection attempts.';
            isConnected = false;
            break;
    }

    if (!isConnected && !isDisplayingDisconnected) {
        isDisplayingDisconnected = true;
        toggleUserStatus("disconnected");
    } else if (isConnected && isDisplayingDisconnected) {
        isDisplayingDisconnected = false;
        toggleUserStatus("disconnected");
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



/// Handling live updates
/**
 * Interval for handling the status display and user activity updates every 50ms.
 */
setInterval(() => {
    // hide status display when logged in
    if (gotDataAt !== -1 && userData.ID !== null) {
        if (new Date().getTime() - gotDataAt > 2000) {
            gotDataAt = -1;
            statusDisplay.style.display = "none";
        }
    }

    // hide status display when not logged in
    if (loggedIn === -1 && userData.ID === null) {
        if (isConnected) {
            if (gotDataAt === -1) {
                gotDataAt = new Date().getTime();
            } else if (new Date().getTime() - gotDataAt > 2000) {
                gotDataAt = 0;
                statusDisplay.style.display = "none";
            }
        } else {
            gotDataAt = -1;
        }
    }

    // handle activity updates
    if (loggedIn !== -1 && isActive) {
        // users go idle after 10 minutes of inactivity
        if (new Date().getTime() - lastActivity > 10*60*1000 && isConnected) {
            isActive = false;

            toggleUserStatus("idle");

            // TODO: send update to server when a user goes idle
            // TODO: handle user disconnects on the server as well
        }
    }
}, 50);

/**
 * Function for toggling the user's status.
 * 
 * @param   string      status      The user's new status.
 * @param   string      username    The user's username.
 * @return  void
 */
function toggleUserStatus(status, username = "") {
    let profileImages = document.getElementsByClassName("userProfileImage" + username);
    for (let i = 0; i < profileImages.length; i++) {
        if (!profileImages[i].classList.contains(status)) {
            profileImages[i].classList.add(status);
        } else {
            profileImages[i].classList.remove(status);
        }
    }

    if (username === "" && loggedIn !== -1) {
        if (!isActive && isConnected) {
            document.title = originalPageTitle + " (idle)";
        } else if (isActive && !isConnected) {
            document.title = originalPageTitle + " (disconnected)";
        } else if(!isActive && !isConnected) {
            document.title = originalPageTitle + " (idle & disconnected)";
        } else {
            document.title = originalPageTitle;
        }
    }
}

document.addEventListener("keydown", activityDetected);

document.addEventListener("mousedown", activityDetected);

/**
 * Function for handling user activity when it is detected.
 */
function activityDetected() {
    if (!isActive) {
        isActive = true;
        toggleUserStatus("idle");
    }

    lastActivity = new Date().getTime();
}