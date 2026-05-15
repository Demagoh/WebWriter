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
    submitButton : document.getElementById("loginFormSubmit"),
    errorField : document.getElementById("loginFormError")
};

/**
 * Function for applying an event listener to the login form.
 * 
 * @param       function    requestServer   The function used for sending requests to the API.
 * @returns     null
 */
export function loginFormHandler(requestServer) {
    
    
    loginForm.form.addEventListener("submit", (e) => {
        e.preventDefault();

        let username = loginForm.usernameInput.value;
        let password = loginForm.passwordInput.value;

        if (!(username.length >= 3 && username.length <= 30)) {
            console.error("The login username is too short/too long.");
            return;
        } else if (!(password.length >= 8)) {
            console.error("The login password is too short.");
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
}