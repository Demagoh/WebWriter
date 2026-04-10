<?php

/**
 * An extension of Demagoh's handy functions for managing PHP-driven websites.
 * 
 * @author  Demagoh     https://github.com/Demagoh
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @version 1.0
 */


/// Include file
require_once("functions.php");

/// Enable easier usage of development subdirectories
$locationPrefix = "";

if (str_contains($_SERVER["REQUEST_URI"], "/development/")) {
    $locationPrefix = "/development/";
} else {
    $locationPrefix = "/";
}

/// Redirect off page when it is navigated to
if (($_SERVER["HTTP_SEC_FETCH_MODE"] == "navigate" || $_SERVER["HTTP_SEC_FETCH_DEST"] == "document") && str_contains($_SERVER["SCRIPT_FILENAME"], "/websiteFunctions.php")) {
    redirectTo($_SERVER["REQUEST_SCHEME"] ."://" .str_replace(":{$_SERVER["SERVER_PORT"]}", "", $_SERVER["HTTP_HOST"]) ."/", false);
}

?>