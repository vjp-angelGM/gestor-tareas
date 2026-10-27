let tareas = [];

let contadorCategoria = {
    javascript: 0,
    html: 0,
    php: 0,
    web: 0,
    ciberseguridad: 0,
    "base de datos": 0,
    monitorizacion: 0
};

// Estado actual de la vista (orden elegido)
let orden = { campo: null, tipo: null, asc: true };

// ----------------------------------------------------
// 1. AÑADIR TAREA
// ----------------------------------------------------
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
    console.log(`Total: ${tareas.length}`, contadorCategoria);
}

// ----------------------------------------------------
// 3. BUSCAR POR TEXTO (nombre o responsable)
//    Sin console: se llama en cada tecla. Con texto vacío devuelve todo.
// ----------------------------------------------------
function buscarPorTexto(texto) {
    const t = texto.trim().toLowerCase();

    return tareas.filter(tarea =>
        tarea.nombre.toLowerCase().includes(t) ||
        tarea.responsable.toLowerCase().includes(t)
    );
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

    if (Object.hasOwn(contadorCategoria, eliminada.categoria)) {
        contadorCategoria[eliminada.categoria]--;
    }

    console.log(`Tarea "${eliminada.nombre}" eliminada.`);
    return true;
}

// ------------------------------------------------------
// 5. ESTADÍSTICAS
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

    const porcentajeAlta = (prioridadAlta / lista.length) * 100;

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

// ----------------------------------------------------
// 6. ORDENAR (no modifica el array original)
//    campo: propiedad | tipo: "texto" o "numero" | asc: true/false
// ----------------------------------------------------
function ordenar(lista, campo, tipo, asc = true) {
    const copia = [...lista];

    copia.sort((a, b) => {
        let resultado;
        if (tipo === "texto") {
            resultado = String(a[campo]).trim().localeCompare(String(b[campo]).trim());
        } else {
            resultado = a[campo] - b[campo];
        }
        return asc ? resultado : -resultado;
    });

    return copia;
}

// ----------------------------------------------------
// 7. TARJETAS EN LA PÁGINA
// ----------------------------------------------------

// Crea UNA tarjeta a partir de UNA tarea (solo devuelve el elemento)
function crearTarjeta(tarea) {
    const tarjeta = document.createElement("div");
    // Clase según la categoría; los espacios se cambian por guiones (tarjeta-base-de-datos)
    tarjeta.classList.add("tarjeta", "tarjeta-" + tarea.categoria.replaceAll(" ", "-"));

    const titulo = document.createElement("h3");
    titulo.textContent = tarea.nombre.trim();

    const detalle = document.createElement("p");
    detalle.textContent =
        `Responsable: ${tarea.responsable} | Prioridad: ${tarea.prioridad} | ` +
        `Estado: ${tarea.estado} | Fecha: ${tarea.fecha}`;

    tarjeta.append(titulo, detalle);
    return tarjeta;
}

// Pinta la colección recibida, escribe el resumen y,
// si no hay resultados, muestra un mensaje en lugar de dejar la página en blanco
function pintar(coleccion, textoBuscado = "") {
    const contenedor = document.querySelector("#contenedor");
    const resumen = document.querySelector("#resumen");

    contenedor.innerHTML = ""; // vaciar antes de pintar: evita duplicados

    if (coleccion.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.classList.add("sin-resultados");

        const buscado = textoBuscado.trim();
        mensaje.textContent = buscado !== ""
            ? `No se encontraron tareas con "${buscado}".`
            : "No hay tareas para mostrar.";

        contenedor.append(mensaje);
    } else {
        coleccion.forEach(tarea => contenedor.append(crearTarjeta(tarea)));
    }

    resumen.textContent = `Mostrando ${coleccion.length} de ${tareas.length} tareas.`;
}

// ----------------------------------------------------
// 8. ACTUALIZAR: filtra -> ordena -> pinta
// ----------------------------------------------------
function actualizar() {
    const texto = document.querySelector("#buscador").value;

    let lista = buscarPorTexto(texto);                                  // 1. filtrar
    if (orden.campo) {
        lista = ordenar(lista, orden.campo, orden.tipo, orden.asc);     // 2. ordenar
    }
    pintar(lista, texto);                                               // 3. pintar
}

// Cambia el criterio de orden; si pulsas el mismo botón, invierte el sentido
function cambiarOrden(campo, tipo) {
    if (orden.campo === campo) {
        orden.asc = !orden.asc;
    } else {
        orden = { campo, tipo, asc: true };
    }
    actualizar();
}

// ----------------------------------------------------
// 9. EVENTOS
// ----------------------------------------------------
document.querySelector("#buscador").addEventListener("input", actualizar);
document.querySelector("#btnTexto").addEventListener("click", () => cambiarOrden("nombre", "texto"));
document.querySelector("#btnNumero").addEventListener("click", () => cambiarOrden("id", "numero"));

// ----------------------------------------------------
// 10. DATOS Y LLAMADAS
// ----------------------------------------------------
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

listar();
console.table(buscarPorTexto("Luis"));
listar();
actualizar(); // pintado inicial