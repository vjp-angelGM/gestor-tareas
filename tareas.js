  let tareas = [];

  let contadorCategoria = {
      javascript: 0,
      html: 0,
      php: 0
  };

  function anadirTarea(tarea) {
      // Validamos que el id no esté repetido
      if (tareas.some(t => t.id === tarea.id)) {
          console.warn(`La tarea con id ${tarea.id} ya existe.`);
          return false;
      }

      tareas.push(tarea);

      // Actualizamos el contador si la categoría es válida
      if (Object.hasOwn(contadorCategoria, tarea.categoria)) {
          contadorCategoria[tarea.categoria]++;
      } else {
          console.warn("Categoría no encontrada:", tarea.categoria);
      }

      console.log("Tarea creada correctamente");
      return true;
  }

  // ----------------------------------------------------
  // 2. LISTAR TODAS LAS TAREAS
  // ----------------------------------------------------
  function listar() {
      if (tareas.length === 0) {
          console.log("No hay tareas creadas.");
          return;
      }

      console.table(tareas);
      console.log(
          `Total: ${tareas.length} | html: ${contadorCategoria.html}, ` +
          `javascript: ${contadorCategoria.javascript}, php: ${contadorCategoria.php}`
      );
  }

  // ----------------------------------------------------
  // 3. BUSCAR POR TEXTO (nombre o responsable)
  // ----------------------------------------------------
  function buscarPorTexto(texto) {
      let resultado = tareas.filter(t =>
          t.nombre.toLowerCase().includes(texto.toLowerCase()) ||
          t.responsable.toLowerCase().includes(texto.toLowerCase())
      );

      if (resultado.length === 0) {
          console.log(`No se encontraron tareas con "${texto}".`);
      } else {
          console.table(resultado);
      }
      return resultado;
  }

  // ----------------------------------------------------
  // 4. ELIMINAR POR ID
  // ----------------------------------------------------
  function eliminarPorId(id) {
      let indice = tareas.findIndex(t => t.id === id);

      if (indice === -1) {
          console.warn(`No existe ninguna tarea con id ${id}.`);
          return false;
      }

      let eliminada = tareas.splice(indice, 1)[0];

      if (contadorCategoria.hasOwnProperty(eliminada.categoria)) {
          contadorCategoria[eliminada.categoria]--;
      }

      console.log(`Tarea "${eliminada.nombre}" eliminada.`);
      return true;
  }

  // ------------------------------------------------------
  // 5. Estadisticas
  // ------------------------------------------------------
  function estadisticas(lista) {
    console.log("Estadísticas de las tareas");

    // Comprobar que lista existe y es un array
    if (!Array.isArray(lista)) {
      console.warn(
        "Error: se esperaba un array de tareas, pero se recibió:",
        lista
      );
      return;
    }

    // Comprobar si está vacío
    if (lista.length === 0) {
      console.warn("No hay datos");
      return;
    }

    let pendientes = 0;
    let prioridadAlta = 0;
    let masProxima = null;

    for (const tarea of lista) {
      // Evitar errores si hay elementos vacíos
      if (!tarea || typeof tarea !== "object") {
        console.warn("Se ha encontrado una tarea no válida:", tarea);
        continue;
      }

      if (tarea.estado === "pendiente") {
        pendientes++;
      }

      if (tarea.prioridad === "alta") {
        prioridadAlta++;
      }

      // Buscar la fecha más próxima válida
      if (tarea.fecha) {
        const fechaTarea = new Date(tarea.fecha);

        if (!Number.isNaN(fechaTarea.getTime())) {
          if (
            masProxima === null ||
            fechaTarea < new Date(masProxima.fecha)
          ) {
            masProxima = tarea;
          }
        }
      }
    }

    const porcentajeAlta =
      (prioridadAlta / lista.length) * 100;

    console.log(`Total: ${lista.length} tareas`);
    console.log(`Pendientes: ${pendientes}`);
    console.log(
      `Prioridad alta: ${prioridadAlta} (${porcentajeAlta.toFixed(1)}%)`
    );

    if (masProxima !== null) {
      console.log(
        `Fecha más próxima: ${masProxima.nombre ?? "Sin nombre"} (${masProxima.fecha})`
      );
    } else {
      console.log("No hay tareas con una fecha válida");
    }
  }

  // Ejemplo de creación de tarea
 anadirTarea({
    id: 1, nombre: "aplicacion javascript", categoria: "javascript",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 2, nombre: "aplicacion html", categoria: "html",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 3, nombre: "aplicacion php", categoria: "php",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 4, nombre: "aplicacion web", categoria: "web",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 5, nombre: "aplicacion sniffing", categoria: "ciberseguridad",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 6, nombre: "aplicacion reconocimiento", categoria: "ciberseguridad",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 7, nombre: "despliegue aplicacion web", categoria: "web",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 8, nombre: "creacion bbdd", categoria: "base de datos",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 9, nombre: "monitorizacion server", categoria: "monitorizacion",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});

anadirTarea({
    id: 10, nombre: "rellenar tabla html", categoria: "html",
    fecha: "2026-10-07", prioridad: "urgente", estado: "pendiente", responsable: "Angel"
});
  // ----------------------------------------------------
  // 6. TARJETAS EN LA PÁGINA
  // ----------------------------------------------------

  // Crea UNA tarjeta a partir de UNA tarea (no toca la página, solo devuelve el elemento)
  function crearTarjeta(tarea) {
      const tarjeta = document.createElement("div");
      // Extra: clase según la categoría (tarjeta-javascript, tarjeta-html, tarjeta-php)
      tarjeta.classList.add("tarjeta", "tarjeta-" + tarea.categoria);

      const titulo = document.createElement("h3");
      titulo.textContent = tarea.nombre.trim();

      const detalle = document.createElement("p");
      detalle.textContent =
          `Responsable: ${tarea.responsable} | Prioridad: ${tarea.prioridad} | ` +
          `Estado: ${tarea.estado} | Fecha: ${tarea.fecha}`;

      tarjeta.append(titulo, detalle);
      return tarjeta;
  }

  // Pinta toda la colección y escribe el resumen
  function pintar(coleccion) {
      const contenedor = document.querySelector("#contenedor");
      const resumen = document.querySelector("#resumen");

      contenedor.innerHTML = ""; // vaciar antes de pintar: evita duplicados si se llama dos veces

      coleccion.forEach(tarea => contenedor.append(crearTarjeta(tarea)));

      resumen.textContent =
          `Hay ${coleccion.length} tareas (html: ${contadorCategoria.html}, ` +
          `javascript: ${contadorCategoria.javascript}, php: ${contadorCategoria.php}).`;
  }

  //Llamadas a las funciones 
  listar();
  buscarPorTexto("Luis");
  listar();
  pintar(tareas);

  