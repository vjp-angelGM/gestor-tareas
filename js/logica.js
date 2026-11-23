// js/logica.js
import { DatosTareas } from "./datos.js";
import { Tarea } from "./tarea.js";

export const DIAS_RECIENTE = 30;
export const REGEX_REFERENCIA = /^[A-Z]{3}-\d{3}$/;
export const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// --- FECHAS ---
export function crearFecha(texto) {
    return new Date(texto + "T00:00:00");
}

export function fechaLegible(texto) {
    return crearFecha(texto).toLocaleDateString("es-ES", {
        day: "numeric", month: "long", year: "numeric"
    });
}

export function diasDesde(texto) {
    const MS_DIA = 24 * 60 * 60 * 1000;
    return Math.floor((Date.now() - crearFecha(texto).getTime()) / MS_DIA);
}

// --- CONTADORES (se calculan a partir de la lista) ---
export function contarPorCategoria(lista) {
    const contador = { javascript: 0, html: 0, php: 0 };
    for (const t of lista) {
        if (Object.hasOwn(contador, t.categoria)) contador[t.categoria]++;
    }
    return contador;
}

export function siguienteId(lista = tareas) {
    return lista.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}


// --- COMPATIBILIDAD con el código anterior (array global y funciones sueltas) ---
export const contadorCategoria = { javascript: 0, html: 0, php: 0 };

export const tareas = [];
for (const datos of DatosTareas) {
    tareas.push(new Tarea(datos));
}
tareas.forEach(t => {
    if (Object.hasOwn(contadorCategoria, t.categoria)) contadorCategoria[t.categoria]++;
});

export function anadirTarea(tarea) {
    if (tareas.some(t => t.id === tarea.id)) return false;
    if (typeof tarea.fecha !== "string" || !REGEX_FECHA.test(tarea.fecha)) return false;
    tareas.push(tarea);
    if (Object.hasOwn(contadorCategoria, tarea.categoria)) contadorCategoria[tarea.categoria]++;
    return true;
}

export function eliminarPorId(id) {
    const i = tareas.findIndex(t => t.id === id);
    if (i === -1) return false;
    const [e] = tareas.splice(i, 1);
    if (Object.hasOwn(contadorCategoria, e.categoria)) contadorCategoria[e.categoria]--;
    return true;
}

// --- ACCIONES ---
// Valida, asigna el id siguiente al mayor, añade y devuelve el id (o null)
export function anadir(lista, tarea) {
    if (typeof tarea.fecha !== "string" || !REGEX_FECHA.test(tarea.fecha)) {
        console.warn("La fecha debe tener formato AAAA-MM-DD:", tarea.fecha);
        return null;
    }

    const fecha = crearFecha(tarea.fecha);
    const [anio, mes, dia] = tarea.fecha.split("-").map(Number);

    if (Number.isNaN(fecha.getTime()) || fecha.getFullYear() !== anio ||
        fecha.getMonth() + 1 !== mes || fecha.getDate() !== dia) {
        console.warn("Fecha no válida:", tarea.fecha);
        return null;
    }

    tarea.id = siguienteId(lista);   // pasa por el setter
    lista.push(tarea);
    return tarea.id;
}

// --- BÚSQUEDA Y ORDENACIÓN ---
export function buscarPorTexto(lista, texto) {
    if (typeof lista === "string") {   // formato antiguo: buscarPorTexto(texto)
        texto = lista;
        lista = tareas;
    }
    const t = texto.trim().toLowerCase();
    return lista.filter(tarea =>
        tarea.nombre.toLowerCase().includes(t) ||
        tarea.responsable.toLowerCase().includes(t)
    );
}

export function ordenar(lista, criterioOrden) {
    const copia = [...lista];
    if (criterioOrden === "nombre") {
        copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterioOrden === "tiempo") {
        copia.sort((a, b) => crearFecha(a.fecha) - crearFecha(b.fecha));
    } else if (criterioOrden === "fecha") {
        copia.sort((a, b) => crearFecha(b.fecha) - crearFecha(a.fecha));
    }
    return copia;
}

// --- ESTADÍSTICAS ---
export function estadisticas(lista) {
    if (!Array.isArray(lista) || lista.length === 0) return null;

    let pendientes = 0, prioridadAlta = 0, masProxima = null;

    for (const tarea of lista) {
        if (!tarea || typeof tarea !== "object") continue;
        if (tarea.estado === "pendiente") pendientes++;
        if (tarea.prioridad === "alta") prioridadAlta++;

        if (tarea.fecha) {
            const fechaTarea = crearFecha(tarea.fecha);
            if (!Number.isNaN(fechaTarea.getTime())) {
                if (masProxima === null || fechaTarea < crearFecha(masProxima.fecha)) {
                    masProxima = tarea;
                }
            }
        }
    }

    return {
        total: lista.length,
        pendientes: pendientes,
        prioridadAlta: prioridadAlta,
        porcentajeAlta: (prioridadAlta / lista.length) * 100,
        masProxima: masProxima
    };
}