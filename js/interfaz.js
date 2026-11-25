// js/interfaz.js
import { Tarea } from "./tarea.js";
import {
    tareas, contadorCategoria, DIAS_RECIENTE, REGEX_REFERENCIA,
    fechaLegible, diasDesde, anadirTarea,
    buscarPorTexto, ordenar, estadisticas, siguienteId
} from "./logica.js";

let criterio = "nombre";

// --- UTILIDADES DEL PANEL ---
function escribir(selector, texto) {
    const el = document.querySelector(selector);
    if (el) el.textContent = texto;
}

// reduce: { alta: 2, media: 1 } -> "alta: 2, media: 1"
function contarPor(coleccion, campo) {
    return coleccion.reduce((acc, t) => {
        acc[t[campo]] = (acc[t[campo]] || 0) + 1;
        return acc;
    }, {});
}

function formatearRecuento(recuento) {
    return Object.entries(recuento)
        .map(([clave, n]) => `${clave}: ${n}`)
        .join(", ") || "-";
}

// --- PINTAR EN PANTALLA ---
function pintarEstadisticas(coleccion) {
    const datos = estadisticas(coleccion); // de logica.js (puede ser null si no hay tareas)

    const total = datos ? datos.total : 0;
    const pendientes = datos ? datos.pendientes : 0;
    const terminadas = coleccion.filter(t => t.estado === "terminada").length;
    const porcentaje = total === 0 ? 0 : Math.round((terminadas / total) * 100);

    escribir("#estTotal", total);
    escribir("#estTerminadas", `${terminadas} (${porcentaje}%)`);
    escribir("#estPendientes", pendientes);
    escribir("#estPrioridad", formatearRecuento(contarPor(coleccion, "prioridad")));
    escribir("#estCategoria", formatearRecuento(contarPor(coleccion, "categoria")));

    // Opcional: solo se muestra si añades <dd id="estProxima"> en el panel
    const proxima = datos && datos.masProxima
        ? `${datos.masProxima.nombre} (${fechaLegible(datos.masProxima.fecha)})`
        : "ninguna";
    escribir("#estProxima", proxima);
}

function crearTarjeta(tarea) {
    const tarjeta = document.createElement("div");
    const claseCategoria = tarea.categoria.trim().toLowerCase().replaceAll(" ", "-");
    tarjeta.classList.add("tarjeta", "tarjeta-" + claseCategoria);
    tarjeta.dataset.id = tarea.id;

    const titulo = document.createElement("h3");
    titulo.textContent = tarea.nombre.trim();

    // El texto lo genera la clase
    const detalle = document.createElement("p");
    detalle.textContent = tarea.descripcion();

    const fecha = document.createElement("p");
    fecha.classList.add("fecha");
    fecha.textContent = fechaLegible(tarea.fecha);

    if (diasDesde(tarea.fecha) <= DIAS_RECIENTE) {
        tarjeta.classList.add("reciente");
    }

    tarjeta.append(titulo, detalle, fecha);
    return tarjeta;
}

// Pinta exactamente la colección que recibe (ya filtrada y ordenada)
function pintar(coleccion) {
    const contenedor = document.querySelector("#contenedor");
    const resumen = document.querySelector("#resumen");
    const mensaje = document.querySelector("#mensaje");
    if (!contenedor) return;

    contenedor.replaceChildren(...coleccion.map(crearTarjeta));

    if (resumen) {
        resumen.textContent = `Hay ${coleccion.length} tareas (html: ${contadorCategoria.html}, javascript: ${contadorCategoria.javascript}, php: ${contadorCategoria.php}).`;
    }

    if (mensaje) mensaje.hidden = coleccion.length !== 0 || tareas.length === 0;
}

// --- FILTRADO ---
function obtenerVisibles() {
    const texto = document.querySelector("#filtro")?.value.trim() ?? "";
    const prioridad = document.querySelector("#filtroPrioridad")?.value ?? "";
    const estado = document.querySelector("#filtroEstado")?.value ?? "";

    return buscarPorTexto(texto)
        .filter(t => !prioridad || t.prioridad === prioridad)
        .filter(t => !estado || t.estado === estado);
}

// --- COOKIES ---
function guardarCookie(nombre, valor, dias) {
    const segundos = dias * 24 * 60 * 60;
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; max-age=${segundos}; path=/; SameSite=Lax`;
}

function leerCookie(nombre) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [clave, ...valor] = cookie.split("=");
        if (clave === nombre) return decodeURIComponent(valor.join("="));
    }
    return null;
}

// --- ACTUALIZAR ---
function actualizar() {
    const visibles = obtenerVisibles();
    pintar(ordenar(visibles, criterio));
    pintarEstadisticas(visibles);
}

function elegirOrden(nuevo) {
    criterio = nuevo;
    guardarCookie("orden", criterio, 30);
    actualizar();
}

// --- FORMULARIO ---
function mostrarAviso(texto, tipo) {
    const aviso = document.querySelector("#aviso");
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.className = "aviso " + (tipo === "ok" ? "aviso-ok" : "aviso-error");
}

function manejarFormulario(evento) {
    evento.preventDefault();
    const form = evento.target;

    const referencia = form.elements.referencia.value.trim();
    const nombre = form.elements.nombre.value.trim();
    const responsable = form.elements.responsable.value.trim();
    const fecha = form.elements.fecha.value;
    const tiempo = form.elements.tiempo?.value;

    if (!REGEX_REFERENCIA.test(referencia)) {
        mostrarAviso("La referencia no es válida. Formato: TAR-001.", "error");
        return;
    }
    if (tareas.some(t => t.referencia === referencia)) {
        mostrarAviso(`La referencia ${referencia} ya existe.`, "error");
        return;
    }
    if (!nombre || !responsable || !fecha) {
        mostrarAviso("Rellena el nombre, el responsable y la fecha.", "error");
        return;
    }

    // Se crea la instancia; si el setter lanza un error, se muestra como aviso
    let nueva;
    try {
        nueva = new Tarea({
            id: siguienteId(),
            referencia, nombre,
            categoria: form.elements.categoria.value,
            fecha,
            prioridad: form.elements.prioridad.value,
            estado: form.elements.estado.value,
            responsable,
            // El tiempo solo se envía si se ha rellenado
            ...(tiempo ? { tiempo: Number(tiempo) } : {})
        });
    } catch (error) {
        mostrarAviso(error.message, "error");
        return;
    }

    if (!anadirTarea(nueva)) {
        mostrarAviso("No se pudo añadir la tarea.", "error");
        return;
    }

    mostrarAviso(`Tarea ${referencia} añadida correctamente.`, "ok");
    form.reset();
    actualizar();
}

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    // Botones de ordenación
    document.querySelector("#ordenNombre")?.addEventListener("click", () => elegirOrden("nombre"));
    document.querySelector("#ordenTiempo")?.addEventListener("click", () => elegirOrden("tiempo"));
    document.querySelector("#ordenFecha")?.addEventListener("click", () => elegirOrden("fecha"));

    // Buscador y filtros
    document.querySelector("#filtro")?.addEventListener("input", actualizar);
    document.querySelector("#filtroPrioridad")?.addEventListener("change", actualizar);
    document.querySelector("#filtroEstado")?.addEventListener("change", actualizar);

    // Formulario
    document.querySelector("#formTarea")?.addEventListener("submit", manejarFormulario);

    // Recuperar cookie
    const ordenGuardado = leerCookie("orden");
    criterio = ["nombre", "tiempo", "fecha"].includes(ordenGuardado) ? ordenGuardado : "nombre";

    // Primera carga: pinta las tarjetas y las estadísticas
    actualizar();
});