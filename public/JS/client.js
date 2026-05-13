/// WebSocket
import {WebSocketManager} from "./WebSocketManager.js";

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
function requestServer(data) {
    serverConnection.sendMessage(data);
}

function handleServerResponse(message) {
    let fullResponse = JSON.parse(atob(message.data));
    let serverResponse = JSON.parse(fullResponse.response);

    console.log(fullResponse.for);
    console.log(serverResponse);
    console.log(serverResponse.response.text)
}