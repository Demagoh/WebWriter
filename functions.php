<?php

/**
 * A collection of handy functions for managing PHP-driven websites.
 * 
 * @author  Demagoh     https://github.com/Demagoh
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @version 1.0
 */



/// Redirect

/**
 * Redirect to specified URL using PHP header(), optionally only do this if the server port is also present in the URI
 * 
 * @param   URL         $url        URL to redirect to.
 * @param   OnPort      $onPort     Whether we should only redirect when the server port is present in the URI. (default: false)
 * @return  Nothing
 * @author  Demagoh     https://github.com/Demagoh
 */
function redirectTo($url, $onPort = false) {
    if (!$onPort || $onPort && str_contains($_SERVER["HTTP_HOST"], $_SERVER["SERVER_PORT"])) {
        header("Location: " .$url);
    }
}

/// HTML <head>

/**
 * Generates an HTML <head> block string.
 * 
 * @param   HeadElements    $headElements       A PHP associative array with the following possible key names:
 * - title          defines the tile of the page                                                            (if not set: "Site")
 * - favicon        location of the favicon displayed in the browser tab                                    (if not set: no favicon)
 * - stylesheets    index array with locations of the CSS stylesheets used on the page                      (if not set: no stylesheets)
 * - keywords       defines the keywords associated with the page                                           (if not set: no keywords)
 * - description    defines the description of the page                                                     (if not set: no description)
 * - author         defines the author of the page                                                          (if not set: no author)
 * - scripts        index array with locations of the JavaScript scripts used on the page                   (if not set: no scripts)
 * - port           forces page to redirect to specified URL if the server port is present in the URI       (if not set: nothing)
 * @return  HTMLHead
 * @author  Demagoh     https://github.com/Demagoh
 */
function HTMLHead($headElements) {
    // start head
    $head = "    <head>\n";

    // title element
    $head .= "        <title>" .(isset($headElements["title"]) ? $headElements["title"] : "Site") ."</title>\n";

    // favicon element
    if (isset($headElements["favicon"])) {
        $head .= "        <link rel=\"icon\" type=\"image/x-icon\" href=\"{$headElements["favicon"]}\" />\n";
    }

    // stylesheet elements
    if (isset($headElements["stylesheets"])) {
        foreach ($headElements["stylesheets"] as $ID => $stylesheet) {
            $head .= "        <link rel=\"stylesheet\" href=\"{$stylesheet}\" />\n";
        }
    }
    
    // keywords element
    if (isset($headElements["keywords"])) {
        $head .= "        <meta name=\"keywords\" content=\"{$headElements["keywords"]}\" />\n";
    }
    
    // description element
    if (isset($headElements["description"])) {
        $head .= "        <meta name=\"description\" content=\"{$headElements["description"]}\" />\n";
    }
    
    // author element
    if (isset($headElements["author"])) {
        $head .= "        <meta name=\"author\" content=\"{$headElements["author"]}\" />\n";
    }
    
    // script elements
    if (isset($headElements["scripts"])) {
        foreach ($headElements["scripts"] as $ID => $script) {
            $head .= "        <script src=\"{$script}\" defer></script>\n";
        }
    }

    // redirect to remove port from URI
    if (isset($headElements["port"])) {
        redirectTo($headElements["port"], true);
    }

    // finish head
    $head .= "    </head>\n";

    // return generated HTML
    return $head;
}

/// Page statuses

/**
 * Generates an HTML <head> block string to tell the visitor that the current page is not accessible.
 * @param   Message     $message    The message to display to the page visitor. (default: "This page is not accessible at this time.")
 * @return  HTMLBody
 * @author  Demagoh     https://github.com/Demagoh
 */
function inaccessiblePage($message = "This page is not accessible at this time.") {
    // start body
    $body = "    <body>\n";

    // append message
    $body .= "        " .$message ."\n";
    
    // end body
    $body .= "    </body>\n";

    // return generated HTML
    return $body;
}

/// Handling visitors of this file's "page"

if (($_SERVER["HTTP_SEC_FETCH_MODE"] == "navigate" || $_SERVER["HTTP_SEC_FETCH_DEST"] == "document") && str_contains($_SERVER["SCRIPT_FILENAME"], "/functions.php")) {
    redirectTo($_SERVER["REQUEST_SCHEME"] ."://" .str_replace(":{$_SERVER["SERVER_PORT"]}", "", $_SERVER["HTTP_HOST"]) ."/", false);
}

?>
