<?php

/**
 * A collection of functions for managing PHP-driven websites.
 * 
 * @author  Demagoh     https://demagoh.com/
 * @license MIT License
 * @version 3.0
 */



/// Redirects
/**
 * Redirect to the specified URL using the PHP header() function.
 * 
 * @param   string      $URL        The URL to redirect to.
 * @return  void                    Doesn't return anything.
 */
function redirectTo($URL) {
    header("Location: " .$URL);
}

/// HTML <head> elements
/**
 * Generates an HTML <head> element as a string.
 * 
 * @param   array   $properties     A PHP associative array with the following possible key names:
 * - title
 *      - String which defines the tile of the page.
 *      - Defaults to "Site".
 * - description
 *      - String defining the description of the page.
 *      - Defaults to not having any description.
 * - favicon
 *      - String which gives the relative location of the favicon file.
 *      - Defaults to not having a favicon.
 * - stylesheets
 *      - Index array with relative locations of CSS stylesheets.
 *      - Defaults to not having any CSS stylesheets.
 * - scripts
 *      - Index array with relative locations of JavaScript scripts.
 *      - Defaults to not having any JavaScript scripts.
 * - modules
 *      - Index array with relative location of JavaScript modules.
 *      - Defaults to not having any JavaScript modules
 * - keywords
 *      - String containing the page's keywords.
 *      - Defaults to not setting any keywords.
 * - author
 *      - String defining the author of the page.
 *      - Defaults to not setting an author.
 * @return  string                  A string containing the HTML for the HTML <head> element.
 */
function HTMLHead($properties) {
    $head = "    <head>\n";     // start the head string

    // add the title
    $head .= "        <title>" .(isset($properties["title"]) ? $properties["title"] : "Site")
        ."</title>\n";

    // add the favicon
    if (isset($properties["favicon"])) {
        $head .= "        <link rel=\"icon\" type=\"image/x-icon\" href=\""
            .$properties["favicon"] ."\" />\n";
    }

    // add the CSS stylesheets
    if (isset($properties["stylesheets"])) {
        foreach ($properties["stylesheets"] as $ID => $stylesheet) {
            $head .= "        <link rel=\"stylesheet\" href=\"" .$stylesheet ."\" />\n";
        }
    }
    
    // add the keywords
    if (isset($properties["keywords"])) {
        $head .= "        <meta name=\"keywords\" content=\"" .$properties["keywords"]
            ."\" />\n";
    }
    
    // add the description
    if (isset($properties["description"])) {
        $head .= "        <meta name=\"description\" content=\"" .$properties["description"]
            ."\" />\n";
    }
    
    // add the author
    if (isset($properties["author"])) {
        $head .= "        <meta name=\"author\" content=\"" .$properties["author"]
            ."\" />\n";
    }
    
    // add the scripts
    if (isset($properties["scripts"])) {
        foreach ($properties["scripts"] as $script) {
            $head .= "        <script src=\"" .$script ."\" defer></script>\n";
        }
    }
    
    // add the modules
    if (isset($properties["modules"])) {
        foreach ($properties["modules"] as $module) {
            $head .= "        <script type=\"module\" src=\"" .$module ."\" defer></script>\n";
        }
    }

    $head .= "    </head>\n";   // end the head string
    return $head;               // return generated string
}

?>