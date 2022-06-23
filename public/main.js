window.addEventListener('load', () => {

    const form = document.querySelector("#new-task-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");

    setInterval(()=>{
        reloadNotes();
    },2000);

    const reloadNotes = () => {
        const xhttp = new XMLHttpRequest();

        xhttp.onload = function() {
            list_el.innerHTML = "";
            // Parse JSON to String so we can print it.
            const notes = JSON.parse(this.responseText);


            for(let notizIndex = 0; notizIndex < notes.length; notizIndex++){
                const task = notes[notizIndex].content;
                const notizUuid = notes[notizIndex].uuid;

                const task_el = document.createElement('div');
                task_el.classList.add('task');

                const task_content_el = document.createElement('div');
                task_content_el.classList.add('content');

                task_el.appendChild(task_content_el);

                const task_input_el = document.createElement('input');
                task_input_el.classList.add('text');
                task_input_el.type = 'text';
                task_input_el.value = task;
                task_input_el.setAttribute('readonly', 'readonly');

                task_content_el.appendChild(task_input_el);

                const task_actions_el = document.createElement('div');
                task_actions_el.classList.add('actions');

                /*
                Create Edit and Delete Button in the Task Bar for each Task.
                */

                const task_delete_el = document.createElement('button');
                task_delete_el.classList.add('delete');
                task_delete_el.innerText = 'Delete';

                task_actions_el.appendChild(task_delete_el);

                task_el.appendChild(task_actions_el);


                list_el.appendChild(task_el);



                task_delete_el.addEventListener('click', () => {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onload = function() {
                        reloadNotes();
                    };

                    xhttp.open("DELETE", "tasks");
                    xhttp.setRequestHeader("Content-type", "application/json");
                    // When communicating content has to be parsed back to JSON.
                    xhttp.send(JSON.stringify({noteUuid:notizUuid}));
                });
            }
        };

        // GET Tasks after the previous was deleted.
        xhttp.open("GET", "tasks");
        xhttp.send();
    };


    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        // variable if user is logged in, JSON to Text.
        var isLoggedIn = JSON.parse(this.responseText);
        if(isLoggedIn){
            // If user gets logged in -> getElementByID(userLoggedIn)
            document.getElementById("userLoggedIn").style.setProperty('visibility', "visible");
            reloadNotes();
        }else{
            // If not, the user goes to Registration.
            document.getElementById("newUser").style.setProperty('visibility', "visible");
        }
    };

    // Logs completely in the profile.
    xhttp.open("GET", "getProfile");
    xhttp.send();

    // Variables for Login and Registration. (from html)
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const logoutButton = document.getElementById("deleteSession");

    /*
     After Logout we want to see the first screen again, so we set the tag "userLoggedIn" to hidden
     and the tag "newUser" to visible.
     */
    logoutButton.addEventListener("click",() => {
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            document.getElementById("userLoggedIn").style.setProperty('visibility', "hidden");
            document.getElementById("newUser").style.setProperty('visibility', "visible");
        };
        xhttp.open("DELETE", "session");
        xhttp.send();
    });

    loginButton.addEventListener("click",() => {

        var email = emailInput.value;
        var password = passwordInput.value;

        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            console.log(JSON.parse(this.responseText).status);
            var isLoggedIn = JSON.parse(this.responseText).status;
            if(isLoggedIn){
                // If Login is successful set "userLoggedIn" tag to visible and "newUser" tag to hidden.
                alert("Willkommen!");
                document.getElementById("userLoggedIn").style.setProperty('visibility', "visible");
                document.getElementById("newUser").style.setProperty('visibility', "hidden");
                reloadNotes();
                // After logging out email and password fields are empty.
                passwordInput.value = "";
                emailInput.value = "";
            }else{
                alert("Password oder Email ist falsch!");
                document.getElementById("userLoggedIn").style.setProperty('visibility', "hidden");
                document.getElementById("newUser").style.setProperty('visibility', "visible");
            }
        };
        // With POST method email and password are sent.
        xhttp.open("POST", "login");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({email,password}));
    });

    registerButton.addEventListener("click",() => {
        var email = emailInput.value;
        var password = passwordInput.value;

        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            console.log(JSON.parse(this.responseText).status);
            var isLoggedIn = JSON.parse(this.responseText).status;
            if(isLoggedIn){
                alert("Willkommen auf unsere Platform!");
                document.getElementById("userLoggedIn").style.setProperty('visibility', "visible");
                document.getElementById("newUser").style.setProperty('visibility', "hidden");
                reloadNotes();
                passwordInput.value = "";
                emailInput.value = "";
            }else{
                alert("Email bereits vorhanden");
                document.getElementById("userLoggedIn").style.setProperty('visibility', "hidden");
                document.getElementById("newUser").style.setProperty('visibility', "visible");
            }
        };
        xhttp.open("POST", "register");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({email,password}));
    });


    form.addEventListener('submit', (e) => {
        // maintains from realoading the whole page when clicking on "Add Task"
        e.preventDefault();
        const task = input.value;
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            reloadNotes(); //-> responsible for creating the task
        };
        xhttp.open("PUT", "tasks");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({noteContent:task}));
        input.value = ''; // -> to not have the same word in the task bar again after submitting.
    });
});
