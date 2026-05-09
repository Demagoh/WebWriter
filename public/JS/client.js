import {WebSocketManager} from "./WebSocketManager.js";

let serverConnection = new WebSocketManager("wss://ws.demagoh.com/", handleMessage, handleUpdate);

function handleMessage(message) {
    console.log(message);
}

function handleUpdate(status) {
    //console.log(status);
}