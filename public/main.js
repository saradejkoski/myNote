window.addEventListener('load', () => {

    const form = document.querySelector("#new-task-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");

    setInterval(()=>{
        reloadNotes();
    },2000);

    const reloadNotes = () => {
        const xhttp = new XMLHttpRequest();
        console.log("HALLO!");
        xhttp.onload = function() {
            list_el.innerHTML = "";
            const notes = JSON.parse(this.responseText);
            console.log(notes);
            console.log("BYE");

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
                    xhttp.send(JSON.stringify({noteUuid:notizUuid}));
                });
            }
        };


        xhttp.open("GET", "tasks");
        xhttp.send();
    };


    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        var isLoggedIn = JSON.parse(this.responseText);
        if(isLoggedIn){
            document.getElementById("userLoggedIn").style.setProperty('visibility', "visible");
            reloadNotes();
        }else{
            document.getElementById("newUser").style.setProperty('visibility', "visible");
        }
    };


    xhttp.open("GET", "getProfile");
    xhttp.send();

    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const logoutButton = document.getElementById("deleteSession");

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
                alert("Willkommen!");
                document.getElementById("userLoggedIn").style.setProperty('visibility', "visible");
                document.getElementById("newUser").style.setProperty('visibility', "hidden");
                reloadNotes();
                passwordInput.value = "";
                emailInput.value = "";
            }else{
                alert("Password Email falsch");
                document.getElementById("userLoggedIn").style.setProperty('visibility', "hidden");
                document.getElementById("newUser").style.setProperty('visibility', "visible");
            }
        };
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
        e.preventDefault();
        const task = input.value;
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            reloadNotes();
        };
        xhttp.open("PUT", "tasks");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({noteContent:task}));
        input.value = '';
    });
});