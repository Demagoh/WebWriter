<?php

if ($argc != 2) {
    die('{"error":"Invalid API usage."}');
}

$APIRequest = base64_decode($argv[1]);
$APIRequestData = json_decode($APIRequest, true);

$request = $APIRequestData["request"];
$data = $APIRequestData["data"];

switch ($request) {
    case "echo":
        response($data);
        break;
}

function response($response = [], $success = true) {
    global $request;

    $serverResponse = [
        "status" => (($success) ? "successful" : "failed"),
        "response" => $response
    ];

    die(json_encode($serverResponse));
}

?>