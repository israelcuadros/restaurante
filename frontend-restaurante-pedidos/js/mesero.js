document.addEventListener("DOMContentLoaded", () => {
    // Obtener el usuario actual del localStorage
    const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}")
  
    // Mostrar el nombre del usuario en la barra de navegación
    const userSpan = document.querySelector(".fw-bold")
    if (userSpan && usuarioActual.name) {
      userSpan.textContent = usuarioActual.name
    }
  
    // Cargar pedidos para el mesero
    cargarPedidosMesero()
  
    // Actualizar pedidos cada 30 segundos
    setInterval(cargarPedidosMesero, 30000)
  
    // Función para cargar los pedidos en la vista del mesero
    async function cargarPedidosMesero() {
      try {
        // Obtener pedidos del servidor
        const response = await fetch("http://localhost:3005/mesero")
        const data = await response.json()
  
        if (response.ok && data.success) {
          // Obtener las tablas
          const tablaPorEntregar = document.querySelector("#Pizza tbody")
          const tablaEntregado = document.querySelector("#Pasta tbody")
  
          if (tablaPorEntregar && tablaEntregado) {
            // Limpiar las tablas
            tablaPorEntregar.innerHTML = ""
            tablaEntregado.innerHTML = ""
  
            // Llenar tabla "Por Entregar"
            if (data.data.porEntregar && data.data.porEntregar.length > 0) {
              data.data.porEntregar.forEach((pedido) => {
                const fila = crearFilaPedido(pedido, "entregar")
                tablaPorEntregar.appendChild(fila)
              })
            } else {
              tablaPorEntregar.innerHTML = '<tr><td colspan="3" class="text-center">No hay pedidos por entregar</td></tr>'
            }
  
            // Llenar tabla "Entregado"
            if (data.data.entregado && data.data.entregado.length > 0) {
              data.data.entregado.forEach((pedido) => {
                const fila = crearFilaPedido(pedido, "entregado")
                tablaEntregado.appendChild(fila)
              })
            } else {
              tablaEntregado.innerHTML = '<tr><td colspan="3" class="text-center">No hay pedidos entregados</td></tr>'
            }
          }
        } else {
          console.error("Error al cargar pedidos:", data.message)
        }
      } catch (error) {
        console.error("Error de conexión al cargar pedidos:", error)
      }
    }
  
    // Función para crear una fila de pedido en la tabla
    function crearFilaPedido(pedido, estado) {
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
  
      // Crear celda para la mesa (en este caso usamos el ID como referencia)
      const celdaMesa = document.createElement("td")
      celdaMesa.textContent = `#${pedido.id}`
      fila.appendChild(celdaMesa)
  
      // Crear celda para el botón de cambio de estado
      const celdaAccion = document.createElement("td")
  
      if (estado === "entregar") {
        const botonAccion = document.createElement("button")
        botonAccion.className = "btn btn-success btn-sm"
        botonAccion.textContent = "Entregado"
        botonAccion.onclick = () => cambiarEstadoPedido(pedido.id)
        celdaAccion.appendChild(botonAccion)
      } else {
        celdaAccion.textContent = "✓ Completado"
      }
  
      fila.appendChild(celdaAccion)
  
      return fila
    }
  
    // Función para cambiar el estado de un pedido a entregado
    async function cambiarEstadoPedido(id) {
      try {
        // Enviar solicitud para cambiar el estado
        const response = await fetch("http://localhost:3005/entregado", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        })
  
        const data = await response.json()
  
        if (response.ok && data.success) {
          // Recargar los pedidos para actualizar la vista
          cargarPedidosMesero()
  
          // Mostrar mensaje de éxito
          mostrarAlerta(`Pedido #${id} marcado como entregado`, "success")
        } else {
          // Mostrar mensaje de error
          mostrarAlerta(data.message || "Error al actualizar el pedido", "danger")
        }
      } catch (error) {
        console.error("Error al cambiar estado del pedido:", error)
        mostrarAlerta("Error de conexión al servidor", "danger")
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
  })
  
  