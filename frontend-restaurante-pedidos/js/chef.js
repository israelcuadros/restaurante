// chef.js - Script para manejar la vista del chef

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el usuario actual del localStorage
    const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}")
  
    // Mostrar el nombre del usuario en la barra de navegación
    const userName = document.querySelector(".fw-bold")
    if (userName && usuarioActual.name) {
      userName.textContent = usuarioActual.name
    }
  
    // Cargar pedidos al iniciar la página
    cargarPedidosChef()
  
    // Actualizar pedidos cada 30 segundos
    setInterval(cargarPedidosChef, 30000)
  })
  
  // Función para cargar pedidos en vista del chef
  async function cargarPedidosChef() {
    try {
      // Obtener respuesta del servidor
      const respuesta = await fetch("http://localhost:3005/chef")
      const data = await respuesta.json()
  
      if (respuesta.ok && data.success) {
        // Obtener las tablas
        const tablaPorPreparar = document.querySelector("#Pizza tbody")
        const tablaPreparando = document.querySelector("#Pasta tbody")
  
        if (tablaPorPreparar && tablaPreparando) {
          // Limpiar las tablas
          tablaPorPreparar.innerHTML = ""
          tablaPreparando.innerHTML = "" // Error corregido: usaba asignación = en lugar de .innerHTML =
  
          // Llenar tabla por preparar
          if (data.data.porPreparar && data.data.porPreparar.length > 0) {
            data.data.porPreparar.forEach((pedido) => {
              const fila = crearFilaPedido(pedido, "preparar")
              tablaPorPreparar.appendChild(fila)
            })
          } else {
            tablaPorPreparar.innerHTML = '<tr><td colspan="3" class="text-center">No hay pedidos por preparar</td></tr>'
          }
  
          // Llenar tabla preparando
          if (data.data.preparando && data.data.preparando.length > 0) {
            data.data.preparando.forEach((pedido) => {
              const fila = crearFilaPedido(pedido, "preparando")
              tablaPreparando.appendChild(fila)
            })
          } else {
            tablaPreparando.innerHTML = '<tr><td colspan="3" class="text-center">No hay pedidos en preparación</td></tr>'
          }
        }
      } else {
        console.error("Error al cargar los pedidos:", data.message)
      }
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error)
    }
  }
  
  // Función para crear una fila del pedido en la tabla
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
  
    // Crear celda para la mesa, usamos ID como referencia
    const celdaMesa = document.createElement("td")
    celdaMesa.textContent = `#${pedido.id}`
    fila.appendChild(celdaMesa)
  
    // Crear celda para el botón de cambio de estado
    const celdaAccion = document.createElement("td")
    const botonAccion = document.createElement("button")
  
    if (estado === "preparar") {
      botonAccion.className = "btn btn-warning btn-sm"
      botonAccion.textContent = "Preparando"
      botonAccion.onclick = () => cambiarEstadoPedido(pedido.id, "preparando")
    } else if (estado === "preparando") {
      botonAccion.className = "btn btn-success btn-sm"
      botonAccion.textContent = "Listo"
      botonAccion.onclick = () => cambiarEstadoPedido(pedido.id, "listo")
    }
  
    celdaAccion.appendChild(botonAccion)
    fila.appendChild(celdaAccion)
  
    return fila
  }
  
  // Función para cambiar el estado de un pedido
  async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
      let endpoint = ""
  
      // Determinar el endpoint según el nuevo estado
      if (nuevoEstado === "preparando") {
        endpoint = "http://localhost:3005/preparando"
      } else if (nuevoEstado === "listo") {
        endpoint = "http://localhost:3005/listo"
      }
  
      // Enviar solicitud para cambiar el estado
      const respuesta = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
  
      const data = await respuesta.json()
  
      if (respuesta.ok && data.success) {
        // Recargar los pedidos para actualizar la vista
        cargarPedidosChef()
        mostrarAlerta(`Pedido #${id} actualizado a ${nuevoEstado}`, "success")
      } else {
        mostrarAlerta(data.message || "Error al actualizar estado de pedido", "danger")
      }
    } catch (error) {
      console.error("Error al cambiar estado del pedido:", error)
      mostrarAlerta("No se pudo conectar a la base de datos", "danger")
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
  
  