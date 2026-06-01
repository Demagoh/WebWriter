/// Imports
import {WebSocketManager} from "./WebSocketManager.js";
import {loginFormHandler, loginForm} from "./login.js";
import {navigation, navigationHandler} from "./navigation.js";



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

let serverConnection = new WebSocketManager(
    "wss://ws.demagoh.com/",
    handleServerResponse,
    handleUpdate
);

function handleUpdate(status) {
    switch (status) {
        case "registered":
            /* requestServer({
                request : "echo",
                data : {
                    text : "test"
                }
            }); */

            if (loggedIn !== -1) {
                requestServer({
                    request : "user/data",
                    data : {
                        cookie : cookies[loggedIn][1]
                    }
                });
            }
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
    if (navigation.buttons) {
        for (let i = 0; i < navigation.buttons.length; i++) {
            let text = navigation.buttons[i].getElementsByTagName("span")[0];
            if (text.innerText.length > 20) {
                text.innerHTML = text.innerText.slice(0, 17).trim() + "..."; 
            }
        }
    }
}, 50);