// js/interfaz.js
import { Tarea } from "./tarea.js";
import {
    tareas, contadorCategoria, DIAS_RECIENTE, REGEX_REFERENCIA,
    fechaLegible, diasDesde, anadirTarea,
    buscarPorTexto, ordenar, estadisticas, siguienteId
} from "./logica.js";

let criterio = "nombre";

// --- PINTAR EN PANTALLA ---
function pintarEstadisticas(datos) {
    const caja = document.querySelector("#estadisticas");
    if (!caja) return;

    if (!datos) {
        caja.textContent = "No hay datos para calcular estadísticas.";
        return;
    }
    const proxima = datos.masProxima ? `${datos.masProxima.nombre} (${fechaLegible(datos.masProxima.fecha)})` : "ninguna";
    caja.textContent = `Total: ${datos.total} | Pendientes: ${datos.pendientes} | Prioridad alta: ${datos.prioridadAlta} (${datos.porcentajeAlta.toFixed(1)}%) | Fecha más próxima: ${proxima}`;
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

function pintar(coleccion) {
    const contenedor = document.querySelector("#contenedor");
    const resumen = document.querySelector("#resumen");
    if (!contenedor || !resumen) return;

    contenedor.replaceChildren();
    coleccion.forEach(tarea => contenedor.appendChild(crearTarjeta(tarea)));

    resumen.textContent = `Hay ${coleccion.length} tareas (html: ${contadorCategoria.html}, javascript: ${contadorCategoria.javascript}, php: ${contadorCategoria.php}).`;

    // Mantener filtro
    const filtro = document.querySelector("#filtro");
    const mensaje = document.querySelector("#mensaje");
    const tarjetas = document.querySelectorAll("#contenedor .tarjeta");
    const texto = filtro ? filtro.value.trim() : "";

    const coincidentes = buscarPorTexto(texto);
    const idsVisibles = new Set(coincidentes.map(t => t.id));

    tarjetas.forEach(t => t.hidden = !idsVisibles.has(Number(t.dataset.id)));
    if (mensaje) mensaje.hidden = coincidentes.length !== 0 || tareas.length === 0;

    pintarEstadisticas(estadisticas(coincidentes));
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
    pintar(ordenar(tareas, criterio));
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
            responsable
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
    // Listeners de botones
    document.querySelector("#ordenNombre")?.addEventListener("click", () => elegirOrden("nombre"));
    document.querySelector("#ordenTiempo")?.addEventListener("click", () => elegirOrden("tiempo"));
    document.querySelector("#ordenFecha")?.addEventListener("click", () => elegirOrden("fecha"));

    // Listener del buscador
    document.querySelector("#filtro")?.addEventListener("input", actualizar);

    // Listener del formulario
    document.querySelector("#formTarea")?.addEventListener("submit", manejarFormulario);

    // Recuperar cookie
    const ordenGuardado = leerCookie("orden");
    criterio = ["nombre", "tiempo", "fecha"].includes(ordenGuardado) ? ordenGuardado : "nombre";

    // Primera carga
    actualizar();
});