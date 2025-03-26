const botonesOrden = document.querySelectorAll(".btn-pedido")


const userName = document.querySelector(".fw-bold")
document.addEventListener("DOMContentLoaded", ()=>{
    const usuarioActual = JSON.parse(localStorage.getItem("usuario") || {})

    //Mostrar el nombre del usuario en la barra de navegación
    if(userName && usuarioActual.name){
        userName.textContent = usuarioActual.name;
    }

    //Agregar evento a boton para crear pedido
    botonesOrden.forEach(boton => {
        boton.addEventListener("click", crearPedido)    
    });
})



async function crearPedido(event) {
    //Obtener el formulario padre del botón
    const form = event.target.closest("form");

    //Obtener los valores del formulario
    const platillo = form.querySelector(".platillo").value
    const cliente = form.querySelector(".cliente").value
    const cantidad = Number.parseInt(form.querySelector(".cantidad").value)
    const fecha = form.querySelector(".fecha").value
    const observaciones = form.querySelector(".observaciones").value

    //Obtener el precio del platillo
    let precio = 0
    const menuActivo = document.querySelector('.menu[style*="display: block"]')

    if(menuActivo) {
        const precioElement = menuActivo.querySelector(".precios")
        if(precioElement) {
            //Extraer el valor númerico del precio (quitar símbolo $ y los puntos)
            precio = Number.parseInt(precioElement.textContent.replace("$", "").replace(/\./g, ""))
        }
    }
     //Validar campos obligatorios
     if (!platillo || !cliente || !cantidad || isNaN(cantidad) || cantidad <= 0 || !fecha) {
        alert("Por favor complete todos los campos");
     }    

     //Guardar cliente en el localStorage
     localStorage.setItem("clientePedido", cliente)


     try {
        //Crear objeto del pedido
        const pedido = {
            platillo,
            precio,
            cantidad,
            observaciones,
            cliente,
            fecha,
        }

        //Enviar pedido al servidor
        const respuesta = await fetch("http://localhost:3005/pedido", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body:JSON.stringify(pedido),
        })

        const data = await respuesta.json();
        if(respuesta.ok && data.success){
            //Mostrar mensaje de exito
            alert("Pedido creado exitosamente")

            form.reset()
        }else {
            alert("Ocurrió un error al crear el pedido 😔")
        }

     } catch (error) {
        alert("Error al enviar pedido a base de datos", error)
     }
}