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

//Creacion de la funcion estadísticas
function estadisticas(lista) {
  console.log("Estadísticas de las tareas");

  if (lista.length === 0) {
    console.warn("No hay datos");
    return;
  }

  let pendientes = 0;
  let prioridadAlta = 0;
  let masProxima = lista[0];

  for (const tarea of lista) {
    if (tarea.estado === "pendiente") {
      pendientes++;
    }
    if (tarea.prioridad === "alta") {
      prioridadAlta++;
    }
    if (new Date(tarea.fecha) < new Date(masProxima.fecha)) {
      masProxima = tarea;
    }
  }

  const porcentajeAlta = (prioridadAlta / lista.length) * 100;

  console.log(`Total: ${lista.length} tareas`);
  console.log(`Pendientes: ${pendientes}`);
  console.log(`Prioridad alta: ${prioridadAlta} (${porcentajeAlta.toFixed(1)}%)`);
  console.log(`Fecha más próxima: ${masProxima.nombre} (${masProxima.fecha})`);
}

// Ejemplo de creación de tarea
anadirTarea({
    id: 1, nombre: "Aprender bucles", categoria: "javascript",
    fecha: "2026-10-20", prioridad: "alta", estado: "pendiente", responsable: "Ana"
});

anadirTarea({
    id: 2, nombre: " maquetar cabecera", categoria: "html",
    fecha: "2026-10-22", prioridad: "media", estado: "en curso", responsable: "Luis"
});

anadirTarea({
    id: 3, nombre: "Conectar base de datos", categoria: "php",
    fecha: "2026-10-25", prioridad: "alta", estado: "pendiente", responsable: "Ana"
});


//Llamadas a las funciones 
listar();
buscarPorTexto("Luis");
eliminarPorId(3);
listar();