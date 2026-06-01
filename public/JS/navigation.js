export const navigation = {
    element : document.getElementById("navigation"),
    toggleButton : document.getElementById("navigationToggle"),
    editorButton : document.getElementById("navigationEditor"),
    settingsButton : document.getElementById("navigationSettings"),
    logoutButton : document.getElementById("navigationLogout"),
    buttons : null,
    status : "full",
    editorElement : document.getElementById("editor"),
    settingsElement : document.getElementById("settings"),
    logoutElement : document.getElementById("logout"),
    logoutConfirmButton : document.getElementById("logoutConfirm"),
    logoutCancelButton : document.getElementById("logoutCancel"),
    loggingOut : false
};

/**
 * Function for applying an event listener to the navigation element's child elements.
 * 
 * @param       function    Function for logging the user out.
 * @returns     void
 */
export function navigationHandler(logoutFunction) {
    // set values we couldn't set before
    navigation.buttons = navigation.element.getElementsByTagName("button");

    // handle navigation toggling
    navigation.toggleButton.addEventListener("click", () => {
        if (navigation.status === "full") {
            navigation.status = "minimized";
            navigation.element.style.width = "initial";

            for (let i = 0; i < navigation.buttons.length; i++) {
                navigation.buttons[i].style.padding = "var(--padding-small) calc(var(--padding-small) + (var(--padding-smaller) - var(--padding-small))/2)";
                navigation.buttons[i].style.gap = "initial";
                navigation.buttons[i].getElementsByTagName("span")[0].style.display = "none";
            }
        } else {
            navigation.status = "full";
            navigation.element.style.width = "15%";

            for (let i = 0; i < navigation.buttons.length; i++) {
                navigation.buttons[i].style.padding = "var(--padding-small) var(--padding-smaller)";
                navigation.buttons[i].style.gap = "var(--margin-smaller)";
                navigation.buttons[i].getElementsByTagName("span")[0].style.display = "initial";
            }
        }
    });



    // handle editor/settings switching
    navigation.editorButton.addEventListener("click", () => {
        if (getComputedStyle(navigation.editorElement, null)["display"] === "none") {
            navigation.editorElement.style.display = "initial";
            navigation.settingsElement.style.display = "none";
        }
    });

    navigation.settingsButton.addEventListener("click", () => {
        if (getComputedStyle(navigation.settingsElement, null)["display"] === "none") {
            navigation.settingsElement.style.display = "initial";
            navigation.editorElement.style.display = "none";
        }
    });



    // handle logout
    navigation.logoutButton.addEventListener("click", () => {
        navigation.logoutElement.style.display = "flex";
    });

    navigation.logoutConfirmButton.addEventListener("click", () => {
        if (!navigation.loggingOut) {
            navigation.loggingOut = true;
            console.info("Logging out...");
            logoutFunction();
        }
    });

    navigation.logoutCancelButton.addEventListener("click", () => {
        navigation.logoutElement.style.display = "none";
    });

    document.addEventListener("keypress", (e) => {
        if (getComputedStyle(navigation.logoutElement, null)["display"] !== "none" &&
            e.key === "Enter" &&
            !navigation.loggingOut) {
            navigation.loggingOut = true;
            console.info("Logging out...");
            logoutFunction();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (getComputedStyle(navigation.logoutElement, null)["display"] !== "none" &&
            e.key === "Escape") {
            navigation.logoutElement.style.display = "none";
        }
    })
}