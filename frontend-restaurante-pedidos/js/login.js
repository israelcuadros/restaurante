
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const d = document;
const loginBtn = d.querySelector(".btnLogin");
const userInput = d.querySelector("#userForm");
const userPassword = d.querySelector("#passForm");
const userRegister = d.querySelector("#userRegister");
const nameUser = d.querySelector("#nameUser");
const rolUser = d.querySelector("#rolUser");
const passUser = d.querySelector("#passUser")
const registerBtn = d.querySelector(".btn-guardar")





document.addEventListener("DOMContentLoaded", () =>{
    //Agregar evento de click al botón
    if(loginBtn){
        loginBtn.addEventListener("click", handeLogin)
    }
    registerBtn.addEventListener("click", handleRegister);
    
})


//Permitir enviar el formulario presionando enter en los campos
if (userInput && userPassword){
    ;[userInput, userPassword].forEach((input) =>
    input.addEventListener("keypress", (event) => {
        if(event.key == "Enter"){
            event.preventDefault()
            handeLogin()
        }
    }))
}

//Función para manejar el inicio de sesión
async function handeLogin() {
    //Obtener los valores de los campos
    user = userInput.value;
    password = userPassword.value;

    //Validar que los campos no estén vacíos
    if(!user || !password) {
        alert("Por favor ingrese usuario y contraseña")
    }

    try {
        //Realizar la petición al servidor
        const response = await fetch("http://localhost:3005/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({user, password}),
        })

        //Procesar la respuesta
        const data = await response.json();

        //Verificar si la autenticación fue exitosa
        if (response.ok && data.success) {
            //Guardar los datos del usuario en localStorage
            localStorage.setItem("usuario", JSON.stringify(data.user));

            //Mostrar mensaje de exito
            alert("Inicio de sesión exitoso.");
            
            //Redireccionar segun rol
            setTimeout(() => {
                redireccionarSegunRol(data.user.rol)
            }, 1000)

        } else  {
            alert("Usuario o contraseña incorrecta");
        }
    } catch (error) {
        alert("Error de petición a la base de datos")
    }

    //Función para redireccionar según el rol
    function redireccionarSegunRol(role){
        switch(role) {
            case "mesero":
                window.location.href = "./mesero.html"
                break
            case "chef":
                window.location.href = "./chef.html"
                break
            case "cajero":
                window.location.href = "./cajero.html"
                break
            default:
                // Si el rol no es reconocido, redirigir a una página predeterminada
                window.location.href = "registro.html"  
        }
    }

    //Verificar si el usuario ya está en localStorage al cargar la página
    function verificarAtenticacion(){
        const usuarioActual = localStorage.getItem("usuario");

        try {
            if(usuarioActual){
                const userData = JSON.parse(usuarioActual)
    
                //Si el usuario ya está autenticado, redirigir según su rol
                redireccionarSegunRol(userData.rol);
            }   
        } catch (error) {
            //Si existe un error, eliminar la información sospechosa para evitar hackeos
            localStorage.removeItem("usuario")   
        }
    }

    //Verificar autenticación al cargar la página
    verificarAtenticacion()
    
}



async function handleRegister() {
    user = userRegister.value;
    userName = nameUser.value;
    rol = rolUser.value;
    password = passUser.value;

    if(!user || !userName || !rol || !password) {
        alert("Por favor ingrese todos los datos!")
    }

    try {


        const responseRegister = await fetch("http://localhost:3005/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({user, name: userName, rol, password}),
        })

        const data = await responseRegister.json();

        if (responseRegister.ok && data.success) {
            //Guardar los datos del usuario en localStorage
            alert("Se ha registrado exitosamente.")
            return;
        } else  {
            alert("No se ha registrado");
        }
    } catch (error) {
        console.error(error)
    }
}

