const botonesOrden = document.querySelectorAll(".btn-pedido")
const moving = document.getElementById("moving")

let path = window.location.pathname

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

if (path.includes("pedidos.html")){
    cargarPedidosCaja()

    setInterval(cargarPedidosCaja, 30000)

    async function cargarPedidosCaja() {
        try {
          // Obtener pedidos del servidor
          const response = await fetch("http://localhost:3005/pedidos")
          const data = await response.json()
    
            // Obtener la tablas
            const tablaPorEntregar = document.querySelector("#Pizza tbody")
    
            if (tablaPorEntregar) {
              // Limpiar la tablas
              tablaPorEntregar.innerHTML = ""
    
              // Llenar tabla "Por Preparar
              if (data.length > 0) {
                data.forEach((pedido) => {
                  const fila = crearFilaPedido(pedido, "preparar");
                  if (fila) {
                    tablaPorEntregar.appendChild(fila);
                  } else {
                    console.error("crearFilaPedido() no devolvió un elemento válido");
                  }
                });
                } else {
                    tablaPorEntregar.innerHTML = '<tr><td colspan="3">No hay pedidos por entregar</td></tr>';
                }
            }
        } catch (error) {
          console.error("Error de conexión al cargar pedidos:", error)
        }
    }
    
    function crearFilaPedido(pedido) {
        if (pedido.estado != "entregado") {
            const fila = document.createElement("tr")
    
        // Crear celda para el platillo
        const celdaPlatillo = document.createElement("td")
        celdaPlatillo.innerHTML = `
                <strong>${pedido.platillo}</strong><br>
                <small>Cliente: ${pedido.cliente}</small><br>
                <small>Cant: ${pedido.cantidad}</small>
                ${pedido.observaciones ? `<br><small>Obs: ${pedido.observaciones}</small>` : ""}
            `
        fila.appendChild(celdaPlatillo)
        const celdaMesa = document.createElement("td")
        celdaMesa.textContent = `#${pedido.id}`
        fila.appendChild(celdaMesa)
    
        // Crear celda para el botón de cambio de estado
        const celdaEstado = document.createElement("td")
        
        if (pedido.estado === "preparar") {
            celdaEstado.textContent = "No ha ingresado a cocina aún"
        } else {
            celdaEstado.textContent = "Se encuentra en otro estado"
        }
      
        fila.appendChild(celdaEstado)

        const celdaAccion = document.createElement("td")

        if (pedido.estado === "preparar") {
          const botonEditar = document.createElement("button")
          const botonEliminar = document.createElement("button")

          botonEditar.className = "btn btn-success btn-sm"
          botonEditar.textContent = "Editar"
          botonEditar.onclick = () => editarPedido(pedido.id, pedido.platillo, pedido.precio, pedido.cantidad, pedido.observaciones, pedido.cliente, pedido.fecha, pedido.estado)

          botonEliminar.className = "btn btn-danger btn-sm"
          botonEliminar.textContent = "Eliminar"
          botonEliminar.onclick = () => deletePedido(pedido.id)

          celdaAccion.appendChild(botonEditar)
          celdaAccion.appendChild(botonEliminar)
        } else {
          celdaAccion.textContent = "No se puede editar ni eliminar"
        }
    
        fila.appendChild(celdaAccion)
    
        return fila
        }
      }
    
      async function editarPedido(id, platillo, precio, cantidad, observaciones, cliente, fecha, estado) {
        try {

            const response = await fetch("http://localhost:3005/pedido", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, platillo, precio, cantidad, observaciones, cliente, fecha, estado }),
              })

            const data = await response.json()
            
            if (response.ok && data.success) {
                let task = e.target.closest('.task'); 
                let texto = task.querySelector('p'); 

                // Crear un input para edición
                let inputEdicion = document.createElement('input');
                inputEdicion.type = 'text';
                inputEdicion.value = texto.innerText;
                inputEdicion.classList.add('input-editar');

                // Reemplazar el texto con el input
                task.replaceChild(inputEdicion, texto);

                // Guardar cambios al presionar Enter
                inputEdicion.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && inputEdicion.value.trim() !== '') {
                        texto.innerText = inputEdicion.value;
                        task.replaceChild(texto, inputEdicion);
                    }
                });

                // Si el input pierde el foco, restaurar el texto
                inputEdicion.addEventListener('blur', () => {
                    texto.innerText = inputEdicion.value;
                    task.replaceChild(texto, inputEdicion);
                });

                // Colocar el foco en el input
                inputEdicion.focus();
            }
            
        } catch (error) {
            console.err
        }
      }

    async function deletePedido(id) {
        try {
            const response = await fetch("http://localhost:3005/pedido", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
              })

            const data = await response.json()

            if (response.ok && data.success) {
                alert("Se ha borrado satisfactoriamente")
                window.location.reload()
            }
        } catch (error) {
            console.error(error)
        }
    }
    
      // Función para mostrar alertas
      function mostrarAlerta(mensaje, tipo) {
        // Verificar si ya existe una alerta
        const alertaExistente = document.querySelector(".alert")
    
        if (alertaExistente) {
          alertaExistente.remove()
        }
    
        // Crear elemento de alerta
        const alerta = document.createElement("div")
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`
        alerta.role = "alert"
        alerta.innerHTML = `
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `
    
        // Insertar la alerta al principio del contenido
        const contenido = document.querySelector(".w3-content")
        if (contenido) {
          contenido.insertBefore(alerta, contenido.firstChild)
    
          // Eliminar la alerta después de 5 segundos
          setTimeout(() => {
            alerta.remove()
          }, 5000)
        }
      }
}

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