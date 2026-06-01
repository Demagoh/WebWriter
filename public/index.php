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
require_once("../app/credentials.php"); // This script holds the credentials of the database user
                                        // in variables $DBUsername and $DBPassword.
require_once("../app/appstate.php");

/// Handle user logins
// Set up database connection.
try {   // I'm using PDO for this app to make it easier for others to switch to different DB.
    $DB = new PDO('mysql:host=localhost;dbname=WebWriter', $DBUsername, $DBPassword);
} catch (PDOException $e) { // If database connection failed we display the SQLSTATE code we got.
    $SQLSTATEErrorCode = $e->getCode();
    die('Failed to connect to database: <a href="https://duckduckgo.com/?q=SQLSTATE+'
        .$SQLSTATEErrorCode .'&t=ffab&atb=v489-1&ia=web" target="_blank">SQLSTATE ' .$e->getCode()
        .'</a>');
}

$appState = WW::undetermined;   // Used for handling app states. An enum would've also worked.

// Check for WebWriter cookies.
foreach ($_COOKIE as $cookieName => $cookieValue) {
    if ($cookieName == "webwriter") {
        $username = substr($cookieValue, 0, 64);
        $password = substr($cookieValue, 64, 64);

        $query = $DB->prepare(" SELECT ID
                                FROM User
                                WHERE SHA2(Username, 256) = :username AND
                                Password = :password;");
        $query->bindParam(":username", $username);
        $query->bindParam(":password", $password);
        if ($query->execute()) {
            if ($query->rowCount() != 1) {
                $appState = WW::login_invalid;
            } else {
                $appState = WW::login_valid;
            }
        } else {
            $appState = WW::login_invalid;
        }
        
        break;  // There should only be one WebWriter cookie, if there are any others...
                // I'd like to know how that happened.
    }
}

// Determine next app state.
if ($appState == WW::login_invalid) {   // Delete WebWriter's cookie if it is invalid.
    setcookie("webwriter", "", ["expires" => time()-3600]);
    $appState = WW::no_login;
} else if ($appState == WW::undetermined) { // Proceed to login.
    $appState = WW::no_login;
}

/// Generate HTML
$HTML = "<!DOCTYPE html>\n<html>\n";

// <head>
$headElements = [ // A collection of things to set up for the website's HTML <head>.
    "title" => "WebWriter",
    "favicon" => "media/placeholderLogo.png",
    "stylesheets" => [
        "CSS/style.css"
    ],
    "keywords" => "WebWriter",
    "description" => "A small web-based writing application, developed by Demagoh.",
    "author" => "Demagoh",
    "scripts" => [],
    "modules" => [
        "JS/client.js"
    ],
    "port" => "https://" .str_replace(":{$_SERVER["SERVER_PORT"]}", "", $_SERVER["HTTP_HOST"])
        .str_replace(".php", "", $_SERVER["REQUEST_URI"])
];
$HTML .= HTMLHead($headElements); // Generate the HTML <head> element and its subelements.

/// Display generated HTML
echo $HTML;

?>
    <body>
        <div id="page">
<?php

/// Handle based on app state
if ($appState == WW::no_login) { // If the user is not logged in show the login form.
    echo '            <form id="loginForm">
                <fieldset>
                    <div>
                        <h1>WebWriter</h1>
                        <span>by <a href="https://github.demagoh.com/" target="_blank">Demagoh</a></span>
                    </div>
                    <img src="media/placeholderLogo.png" alt="Placeholder image for the WebWriter logo." />
                </fieldset>
                <fieldset>
                    <label>Username</label>
                    <input id="loginFormUsername" minlength="3" maxlength="30" type="text" required />
                </fieldset>
                <fieldset>
                    <label>Password</label>
                    <fieldset>
                        <input id="loginFormPassword" minlength="8" type="password" required />
                        <button type="button" id="loginFormPasswordReveal">
                            <img id="loginFormPasswordRevealImage" src="media/eyeVisible.svg" loading="lazy" />
                        </button>
                    </fieldset>
                </fieldset>
                <fieldset>
                    <span id="loginFormError"></span>
                </fieldset>
                <fieldset>
                    <input id="loginFormSubmit" type="submit" value="Log in" />
                </fieldset>
            </form>';
} else { // If the user is logged in show the app UI.
    echo '            <div id="navigation">
                <button id="navigationToggle">
                    <img src="media/menu.svg" loading="lazy" />
                    <span>Menu</span>
                </button>
                <button id="navigationEditor">
                    <img src="media/editor.svg" loading="lazy" />
                    <span>Editor</span>
                </button>
                <div>
                    <button class="navigationFile">
                        <img src="media/file.svg" loading="lazy" />
                        <span>Placeholder file button lalalalalalal</span>
                    </button>
                    <button id="navigationNewFile">
                        <img src="media/new.svg" loading="lazy" />
                        <span>New file</span>
                    </button>
                </div>
                <button id="navigationSettings">
                    <img src="media/settings.svg" loading="lazy" />
                    <span>Settings</span>
                </button>
                <button id="navigationLogout">
                    <img src="media/logout.svg" loading="lazy" />
                    <span>Log out</span>
                </button>
            </div>
            <div id="editor">
                <h1>Editor</h1>
            </div>
            <div id="settings">
                <h1>Settings</h1>
            </div>
            <div id="logout">
                <div>
                    Are you sure you want to log out?
                    <div>
                        <button id="logoutConfirm">Log out</button>
                        <button id="logoutCancel">Cancel</button>
                    </div>
                </div>
            </div>';
}

?>
        </div>
    </body>
</html>