
// ====================================================
// 1. VARIABLES Y CONSTANTES
// ====================================================

let tareas = [];

const DIAS_RECIENTE = 30;

let contadorCategoria = {
    javascript: 0,
    html: 0,
    php: 0
};

// Expresiones regulares
// Referencia: 3 letras mayúsculas, un guion y 3 números (ejemplo: TAR-001)
const REGEX_REFERENCIA = /^[A-Z]{3}-\d{3}$/;
// Fecha guardada como AAAA-MM-DD
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;


// Criterio de orden actual
let criterio = "nombre";


// ====================================================
// 2. FUNCIONES PARA LAS FECHAS (B2)
// ====================================================

// Convierte el texto AAAA-MM-DD en una fecha
function crearFecha(texto) {
    return new Date(texto + "T00:00:00");
}


// Convierte una fecha en formato legible
function fechaLegible(texto) {
    return crearFecha(texto).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// Calcula los días transcurridos desde una fecha
function diasDesde(texto) {
    const MS_DIA = 24 * 60 * 60 * 1000;
    const ms = Date.now() - crearFecha(texto).getTime();

    return Math.floor(ms / MS_DIA);
}


// ====================================================
// 3. AÑADIR TAREAS
// ====================================================

function anadirTarea(tarea) {

    // Validamos que el id no esté repetido
    if (tareas.some(t => t.id === tarea.id)) {
        console.warn(`La tarea con id ${tarea.id} ya existe.`);
        return false;
    }

    // Validamos que la fecha tenga formato AAAA-MM-DD
    if (
        typeof tarea.fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(tarea.fecha)
    ) {
        console.warn("La fecha debe tener formato AAAA-MM-DD:", tarea.fecha);
        return false;
    }

    // Validamos la fecha utilizando la hora local
    const fecha = crearFecha(tarea.fecha);

    const [anio, mes, dia] = tarea.fecha.split("-").map(Number);

    if (
        Number.isNaN(fecha.getTime()) ||
        fecha.getFullYear() !== anio ||
        fecha.getMonth() + 1 !== mes ||
        fecha.getDate() !== dia
    ) {
        console.warn("Fecha no válida:", tarea.fecha);
        return false;
    }

    // Añadimos la tarea
    tareas.push(tarea);

    // Actualizamos el contador si la categoría es válida
    if (Object.hasOwn(contadorCategoria, tarea.categoria)) {
        contadorCategoria[tarea.categoria]++;
    } else {
        console.warn("Categoría no encontrada:", tarea.categoria);
    }

    console.log("Tarea creada correctamente:", tarea.nombre);

    return true;
}


// ====================================================
// 4. LISTAR TODAS LAS TAREAS
// ====================================================

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


// ====================================================
// 5. BUSCAR POR TEXTO (NOMBRE O RESPONSABLE)
// ====================================================

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


// ====================================================
// 6. ELIMINAR POR ID
// ====================================================

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


// ====================================================
// 7. ESTADÍSTICAS
// ====================================================

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
            const fechaTarea = crearFecha(tarea.fecha);

            if (!Number.isNaN(fechaTarea.getTime())) {
                if (
                    masProxima === null ||
                    fechaTarea < crearFecha(masProxima.fecha)
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


// ====================================================
// 8. EJEMPLOS DE CREACIÓN DE TAREAS
// ====================================================

anadirTarea({
    id: 1,
    nombre: "aplicacion javascript",
    categoria: "javascript",
    fecha: "2025-10-07",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 2,
    nombre: "aplicacion html",
    categoria: "html",
    fecha: "2026-11-07",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 3,
    nombre: "aplicacion php",
    categoria: "php",
    fecha: "2026-12-07",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 4,
    nombre: "aplicacion web",
    categoria: "web",
    fecha: "2026-10-15",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 5,
    nombre: "aplicacion sniffing",
    categoria: "ciberseguridad",
    fecha: "2026-09-21",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 6,
    nombre: "aplicacion reconocimiento",
    categoria: "ciberseguridad",
    fecha: "2026-08-23",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 7,
    nombre: "despliegue aplicacion web",
    categoria: "web",
    fecha: "2024-11-12",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 8,
    nombre: "creacion bbdd",
    categoria: "base de datos",
    fecha: "2026-10-07",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 9,
    nombre: "monitorizacion server",
    categoria: "monitorizacion",
    fecha: "2026-04-22",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});

anadirTarea({
    id: 10,
    nombre: "rellenar tabla html",
    categoria: "html",
    fecha: "2023-04-04",
    prioridad: "urgente",
    estado: "pendiente",
    responsable: "Angel"
});


// ====================================================
// 9. TARJETAS EN LA PÁGINA
// ====================================================

// Crea una tarjeta a partir de una tarea
function crearTarjeta(tarea) {

    const tarjeta = document.createElement("div");

    // Clase según la categoría
    const claseCategoria = tarea.categoria
        .trim()
        .toLowerCase()
        .replaceAll(" ", "-");

    tarjeta.classList.add("tarjeta", "tarjeta-" + claseCategoria);

    const titulo = document.createElement("h3");
    titulo.textContent = tarea.nombre.trim();

    const detalle = document.createElement("p");

    detalle.textContent =
        `Responsable: ${tarea.responsable} | Prioridad: ${tarea.prioridad} | ` +
        `Estado: ${tarea.estado}`;

    // ------------------------------------------------
    // B3. FECHA EN LA TARJETA Y LO RECIENTE DESTACADO
    // ------------------------------------------------

    const fecha = document.createElement("p");

    fecha.classList.add("fecha");

    fecha.textContent = fechaLegible(tarea.fecha);

    // Si la tarea tiene 30 días o menos, se destaca
    if (diasDesde(tarea.fecha) <= DIAS_RECIENTE) {

        tarjeta.classList.add("reciente");

    }

    tarjeta.append(titulo, detalle, fecha);

    return tarjeta;
}


/// ====================================================
// PINTAR TARJETAS
// ====================================================

function pintar(coleccion) {

    const contenedor = document.querySelector("#contenedor");
    const resumen = document.querySelector("#resumen");

    if (!contenedor) {
        console.error("No existe el contenedor de tareas.");
        return;
    }

    if (!resumen) {
        console.error("No existe el elemento resumen.");
        return;
    }

    // Limpiamos las tarjetas anteriores
    contenedor.replaceChildren();

    // Creamos las tarjetas
    coleccion.forEach(tarea => {

        const tarjeta = crearTarjeta(tarea);

        contenedor.appendChild(tarjeta);

    });

    // Actualizamos el resumen
    resumen.textContent =
        `Hay ${coleccion.length} tareas (html: ${contadorCategoria.html}, ` +
        `javascript: ${contadorCategoria.javascript}, php: ${contadorCategoria.php}).`;

    console.log("Tarjetas pintadas:", coleccion.length);
}


// ====================================================
// COOKIES: GUARDAR Y LEER
// ====================================================

function guardarCookie(nombre, valor, dias) {

    const segundos = dias * 24 * 60 * 60;

    // Codificar el valor de la cookie
    const valorCodificado = encodeURIComponent(valor);

    document.cookie =
        `${nombre}=${valorCodificado}; max-age=${segundos}; path=/; SameSite=Lax`;
}


function leerCookie(nombre) {

    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {

        const [clave, ...valor] = cookie.split("=");

        if (clave === nombre) {

            // Decodificar el valor de la cookie
            return decodeURIComponent(valor.join("="));

        }
    }

    return null;
}

// ====================================================
// 11. ORDENAR Y ACTUALIZAR LA VISTA
// ====================================================

function ordenar(lista, criterioOrden) {

    // Copia para no alterar el array original
    const copia = [...lista];

    if (criterioOrden === "nombre") {

        copia.sort((a, b) => a.nombre.localeCompare(b.nombre));

    } else if (criterioOrden === "tiempo") {

        copia.sort((a, b) => crearFecha(a.fecha) - crearFecha(b.fecha));

    } else if (criterioOrden === "fecha") {

        // B4. Más recientes primero
        copia.sort((a, b) => crearFecha(b.fecha) - crearFecha(a.fecha));

    }

    return copia;
}


// Muestra la cookie en la consola
function mostrarCookie() {

    console.log("Cookie orden:", leerCookie("orden") ?? "(todavía no existe)");

    console.log("document.cookie:", document.cookie || "(vacío)");
}


// Actualiza las tarjetas
function actualizar() {

    pintar(ordenar(tareas, criterio));

    mostrarCookie();
}


function elegirOrden(nuevo) {

    criterio = nuevo;

    // Guardar preferencia durante 30 días
    guardarCookie("orden", criterio, 30);

    // Actualizar las tarjetas
    actualizar();
}

// ====================================================
// 12. INICIALIZACIÓN DE LA APLICACIÓN
// ====================================================

document.addEventListener("DOMContentLoaded", () => {

    // Botón ordenar por nombre
    document.querySelector("#ordenNombre")
        ?.addEventListener("click", () => elegirOrden("nombre"));

    // Botón ordenar por tiempo
    document.querySelector("#ordenTiempo")
        ?.addEventListener("click", () => elegirOrden("tiempo"));

    // Botón ordenar por fecha (más recientes primero)
    document.querySelector("#ordenFecha")
        ?.addEventListener("click", () => elegirOrden("fecha"));


    // Listar tareas en consola
    listar();

    // Buscar tareas
    buscarPorTexto("Luis");


    // Recuperar el criterio guardado en la cookie
    const ordenGuardado = leerCookie("orden");

    criterio = ["nombre", "tiempo", "fecha"].includes(ordenGuardado)
        ? ordenGuardado
        : "ninguno";


    // Pintar las tarjetas al iniciar
    actualizar();


    console.log("Aplicación inicializada correctamente.");

});
// ====================================================
// 12. INICIALIZACIÓN DE LA APLICACIÓN
// ====================================================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------
    // BOTONES DE ORDENACIÓN
    // -----------------------------------------------

    document.querySelector("#ordenNombre")
        ?.addEventListener("click", () => elegirOrden("nombre"));

    document.querySelector("#ordenTiempo")
        ?.addEventListener("click", () => elegirOrden("tiempo"));

    document.querySelector("#ordenFecha")
        ?.addEventListener("click", () => elegirOrden("fecha"));


    // -----------------------------------------------
    // RECUPERAR COOKIE
    // -----------------------------------------------

    const ordenGuardado = leerCookie("orden");

    criterio = ["nombre", "tiempo", "fecha"].includes(ordenGuardado)
        ? ordenGuardado
        : "ninguno";


    // -----------------------------------------------
    // MOSTRAR INFORMACIÓN
    // -----------------------------------------------

    listar();

    buscarPorTexto("Luis");


    // -----------------------------------------------
    // PINTAR TARJETAS
    // -----------------------------------------------

    actualizar();

    console.log("Aplicación inicializada correctamente.");

});