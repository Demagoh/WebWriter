/**
 * Function for hashing strings.
 */
async function hash(toHash) {
    // create a Uint8Array
    const buffer = new TextEncoder().encode(toHash);
    
    // hash the string
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    
    // convert to a usable hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(bufferElement =>
        ('00' +bufferElement.toString(16)).slice(-2)).join('');

    return hash;
}

export const loginForm = {
    form : document.getElementById("loginForm"),
    usernameInput : document.getElementById("loginFormUsername"),
    passwordInput : document.getElementById("loginFormPassword"),
    passwordRevealButton : document.getElementById("loginFormPasswordReveal"),
    passwordRevealImage : document.getElementById("loginFormPasswordRevealImage"),
    submitButton : document.getElementById("loginFormSubmit"),
    errorField : document.getElementById("loginFormError"),
    previousUsernameValue : " ",
    previousPasswordValue : " "
};

/**
 * Function for applying an event listener to the login form and its elements.
 * 
 * @param       function    requestServer   The function used for sending requests to the API.
 * @returns     void
 */
export function loginFormHandler(requestServer) {
    // handle login request
    loginForm.form.addEventListener("submit", (e) => {
        e.preventDefault();

        let username = loginForm.usernameInput.value.toLowerCase();
        let password = loginForm.passwordInput.value;

        if (!(username.length >= 3 && username.length <= 30)) {
            console.error("The login username is too short/too long.");
            return;
        } else if (!(password.length >= 8)) {
            console.error("The login password is too short.");
            return;
        }

        if (username === loginForm.previousUsernameValue &&
            password === loginForm.previousPasswordValue) {
            loginForm.errorField.innerHTML = "Enter a new username or password.";
            return;
        }

        hash(password).then((hashedPassword) => {
            password = hashedPassword;

            requestServer({
                request : "login",
                data : {
                    username : username,
                    password : password
                }
            });
        });
    });



    // handle visual representation of login credential changes
    loginForm.usernameInput.addEventListener("input", () => {
        if (loginForm.usernameInput.classList.contains("invalid") &&
            loginForm.previousUsernameValue !== loginForm.usernameInput.value) {
            loginForm.usernameInput.classList.remove("invalid");
            loginForm.passwordInput.classList.remove("invalid");
        } else if (loginForm.previousUsernameValue === loginForm.usernameInput.value) {
            loginForm.usernameInput.classList.add("invalid");
            loginForm.passwordInput.classList.add("invalid");
        }

        if (loginForm.usernameInput.checkVisibility() &&
            loginForm.passwordInput.checkVisibility() &&
            !loginForm.usernameInput.classList.contains("invalid")) {
            loginForm.submitButton.classList.add("validInputs");
        } else {
            loginForm.submitButton.classList.remove("validInputs");
        }
    });

    loginForm.passwordInput.addEventListener("input", () => {
        if (loginForm.passwordInput.classList.contains("invalid") &&
            loginForm.previousPasswordValue !== loginForm.passwordInput.value) {
            loginForm.usernameInput.classList.remove("invalid");
            loginForm.passwordInput.classList.remove("invalid");
        } else if (loginForm.previousPasswordValue === loginForm.passwordInput.value) {
            loginForm.usernameInput.classList.add("invalid");
            loginForm.passwordInput.classList.add("invalid");
        }

        if (loginForm.usernameInput.checkValidity() &&
            loginForm.passwordInput.checkValidity() &&
            !loginForm.usernameInput.classList.contains("invalid")) {
            loginForm.submitButton.classList.add("validInputs");
        } else {
            loginForm.submitButton.classList.remove("validInputs");
        }
    });



    // handle password reveal/conceal
    loginForm.passwordRevealButton.addEventListener("click", () => {
        if (loginForm.passwordInput.getAttribute("type") === "password") {
            loginForm.passwordInput.setAttribute("type", "text");
            loginForm.passwordRevealImage.setAttribute("src", "media/eyeInvisible.svg");
        } else {
            loginForm.passwordInput.setAttribute("type", "password");
            loginForm.passwordRevealImage.setAttribute("src", "media/eyeVisible.svg");
        }
    });
}