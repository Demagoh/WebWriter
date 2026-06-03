<?php

/// Import files
require_once("credentials.php");    // This script holds the credentials of the database user
                                    // in variables $DBUsername and $DBPassword.



/// Connect to database
try {   // I'm using PDO for this app to make it easier for others to switch to different DB.
    $DB = new PDO('mysql:host=localhost;dbname=WebWriter', $DBUsername, $DBPassword);
} catch (PDOException $e) { // If database connection failed we display the SQLSTATE code we got.
    response([
        "reason" => "Database returned SQLCODE " .$e->getCode() ."."
    ], false);
}



/// Handle request
if ($argc != 2) {
    die('{"error":"Invalid API usage."}');
}

$APIRequest = base64_decode($argv[1]);
$APIRequestData = json_decode($APIRequest, true);

$request = explode("/", $APIRequestData["request"]);
$data = $APIRequestData["data"];



/// Execute based on request type
switch ($request[0]) {
    case "echo":
        response($data);
    case "login":
        if (!isset($data["username"])) {
            response([
                "reason" => "Missing login username."
            ], false);
        }

        if (!isset($data["password"])) {
            response([
                "reason" => "Missing login password."
            ], false);
        }

        $username = $data["username"];
        $password = $data["password"];

        $query = $DB->prepare(" SELECT ID
                                FROM User
                                WHERE Username = :username AND
                                Password = :password;");
        $query->bindParam(":username", $username);
        $query->bindParam(":password", $password);
        if ($query->execute()) {
            if ($query->rowCount() != 1) {
                response([
                    "status" => "error",
                    "reason" => "No unique users with this username and password exist."
                ]);
            } else {
                response([
                    "status" => "success",
                    "cookieValue" => hash("sha256", $query->fetch(PDO::FETCH_ASSOC)["ID"])
                        .hash("sha256", $username) .$password
                ]);
            }
        } else {
            response([
                "reason" => "Something went wrong when retrieving stored user login data."
            ], false);
        }
    case "user":
        if (!isset($request[1])) {
            unkown();
        }

        switch ($request[1]) {
            case "data":
                if (!isset($data["cookie"])) {
                    response([
                        "reason" => "Missing WebWriter cookie data."
                    ], false);
                }

                $cookie = $data["cookie"];

                $userID = substr($cookie, 0, 64);
                $username = substr($cookie, 64, 64);
                $password = substr($cookie, 128, 64);

                $query = $DB->prepare(" SELECT ID, Username
                                        FROM User
                                        WHERE SHA2(ID, 256) = :userID AND
                                        SHA2(Username, 256) = :username AND
                                        Password = :password;");
                $query->bindParam(":userID", $userID);
                $query->bindParam(":username", $username);
                $query->bindParam(":password", $password);
                if ($query->execute()) {
                    $result = $query->fetch();
                    $userID = $result["ID"];
                    $username = $result["Username"];
                    response([
                        "userID" => $userID,
                        "username" => $username
                    ]);
                } else {
                    response([
                        "reason" => "Something went wrong while retrieving stored user data."
                    ]);
                }
            default:
                unkown();
        }
    default:
        // handle unkown requests
        unkown();
}



/// Handle response
/**
 * Function that sends the response back to the client.
 * 
 * @param   array   $response       Associative array with the data we want to send back.
 * @param   bool    $success        Flag for setting the request success status.
 * @return  void                    Doesn't return anything.   
 */
function response($response = [], $success = true) {
    $serverResponse = [
        "status" => (($success) ? "successful" : "failed"),
        "response" => $response
    ];

    die(json_encode($serverResponse));
}

/**
 * Function for creating and sending an "Unkown request ..." response to the client.
 * @return  void    Doesn't return anything.
 */
function unkown() {
    global $request;

    response([
        "reason" => "Unkown request: \"" .implode("/", $request) ."\""
    ], false);
}

?>