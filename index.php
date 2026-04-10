<?php

/**
 * WebWriter main page.
 * 
 * @author  Demagoh     https://github.com/Demagoh
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @version 1.0
 */

/// Import PHP files
require_once("websiteFunctions.php");

/// Generate HTML
$HTML = "<!DOCTYPE html>\n<html>\n";

// <head>
$headElements = [
    "title" => "WebWriter",
    "favicon" => "",
    "stylesheets" => [],
    "keywords" => "WebWriter",
    "description" => "A small web-based writing application, developed by Demagoh.",
    "author" => "Demagoh",
    "scripts" => [],
    "port" => "https://" .str_replace(":{$_SERVER["SERVER_PORT"]}", "", $_SERVER["HTTP_HOST"]) .str_replace(".php", "", $_SERVER["REQUEST_URI"])
];
$HTML .= HTMLHead($headElements);

/// Display generated HTML
echo $HTML;

?>
    <body style="visibility: hidden">
        <div id="page">
            text
            <p style="text-align: center; font-size: 0.75rem;">&copy; Demagoh. All rights reserved.</p>
        </div>
    </body>
</html>