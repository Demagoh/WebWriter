<?php

/**
 * WebWriter main page.
 * 
 * @author  Demagoh     https://github.com/Demagoh
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @version 0.1 - WIP
 */

/// Import PHP files
require_once("../app/functions.php");
require_once("../app/credentials.php"); // This script holds the credentials of the database user in variables $DBUsername and $DBPassword.
require_once("../app/appstate.php");

/// Handle user logins
// Set up database connection.
try { // I'm using PDO for this app to make it easier for others to switch to different DB.
    $DB = new PDO('mysql:host=localhost;dbname=WebWriter', $DBUsername, $DBPassword);
} catch (PDOException $e) { // If database connection failed we inform the user which SQLSTATE code we got.
    $SQLSTATEErrorCode = $e->getCode();
    die('Failed to connect to database: <a href="https://duckduckgo.com/?q=SQLSTATE+' .$SQLSTATEErrorCode
        .'&t=ffab&atb=v489-1&ia=web" target="_blank">SQLSTATE ' .$e->getCode() .'</a>');
}

$appState = WW::undetermined; // Used for handling different app states. An enum would've worked too I guess.

// Check for WebWriter cookies.
foreach ($_COOKIE as $cookieName => $cookieValue) {
    if ($cookieName == "webwriter") {
        $query = $DB->prepare("SELECT ID FROM User WHERE SHA2(Username, 256) = :username AND Password = :password;");
        $query->bindParam(":username", substr($cookieValue, 0, 64));
        $query->bindParam(":password", substr($cookieValue, 64, 64));
        $query->execute();

        print_r($query);

        $loginCookie = true; // placeholder value, change later
        $appState = WW::login_valid;
        break; // There should only be one WebWriter cookie, if there are any others... I'd like to know how that happened.
    }
}

// Determine next app state.
if ($appState == WW::login_invalid) { // Delete WebWriter's cookie if it is invalid and proceed to login.
    setcookie("webwriter", "", ["expires" => time()-3600]);
    $appState = WW::no_login;
} else if ($appState == WW::undetermined) { // If there are no WebWriter cookies present we proceed to login.
    $appState = WW::no_login;
}

/// Generate HTML
$HTML = "<!DOCTYPE html>\n<html>\n";

// <head>
$headElements = [ // A collection of things to set up for the website so we don't have to write the entire HTML <head> manually.
    "title" => "WebWriter",
    "favicon" => "",
    "stylesheets" => [
        "style.css"
    ],
    "keywords" => "WebWriter",
    "description" => "A small web-based writing application, developed by Demagoh.",
    "author" => "Demagoh",
    "scripts" => [],
    "port" => "https://" .str_replace(":{$_SERVER["SERVER_PORT"]}", "", $_SERVER["HTTP_HOST"]) .str_replace(".php", "", $_SERVER["REQUEST_URI"])
];
$HTML .= HTMLHead($headElements); // Generate the HTML <head> element and its subelements.

/// Display generated HTML
echo $HTML;

?>
    <body>
        <div id="page">
<?php

/// Handle based on app state
// TODO: handle

?>
        </div>
    </body>
</html>