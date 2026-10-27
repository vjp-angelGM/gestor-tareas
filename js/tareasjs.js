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
// 1. AÑADIR TAREA (el id se calcula solo)
// ----------------------------------------------------
function anadirTarea(datos) {
    // Validamos el campo numérico
    if (typeof datos.horas !== "number" || Number.isNaN(datos.horas) || datos.horas < 0) {
        console.warn("Horas no válidas:", datos.horas);
        return false;
    }

    // id = mayor id existente + 1 (o 1 si no hay tareas)
    const nuevoId = tareas.length === 0
        ? 1
        : Math.max(...tareas.map(t => t.id)) + 1;

    const tarea = { id: nuevoId, ...datos };
    tareas.push(tarea);

    // Actualizamos el contador si la categoría es válida
    if (Object.hasOwn(contadorCategoria, tarea.categoria)) {
        contadorCategoria[tarea.categoria]++;
    } else {
        console.warn("Categoría no encontrada:", tarea.categoria);
    }

    console.log(`Tarea creada con id ${nuevoId}`);
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
// 4. FILTRAR con && (prioridad, estado y horas mínimas)
//    Un criterio vacío significa "no filtrar por él".
// ----------------------------------------------------
function filtrar(lista, { prioridad = "", estado = "", horasMin = 0 }) {
    return lista.filter(t =>
        (prioridad === "" || t.prioridad === prioridad) &&
        (estado === "" || t.estado === estado) &&
        t.horas >= horasMin
    );
}

// ----------------------------------------------------
// 5. ELIMINAR POR ID
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

// ----------------------------------------------------
// 6. RECUENTO POR PRIORIDAD con switch
// ----------------------------------------------------
function recuentoPorPrioridad(lista) {
    let alta = 0, media = 0, baja = 0, otras = 0;

    for (const tarea of lista) {
        switch (tarea.prioridad) {
            case "alta":
                alta++;
                break;
            case "media":
                media++;
                break;
            case "baja":
                baja++;
                break;
            default:
                otras++;
        }
    }

    return { alta, media, baja, otras };
}

// ------------------------------------------------------
// 7. ESTADÍSTICAS
// ------------------------------------------------------
function estadisticas(lista) {
    console.log("Estadísticas de las tareas");

    if (!Array.isArray(lista)) {
        console.warn("Error: se esperaba un array de tareas, pero se recibió:", lista);
        return;
    }

    if (lista.length === 0) {
        console.warn("No hay datos");
        return;
    }

    let pendientes = 0;
    let prioridadAlta = 0;
    let totalHoras = 0;
    let masProxima = null;

    for (const tarea of lista) {
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

        if (typeof tarea.horas === "number") {
            totalHoras += tarea.horas;
        }

        if (tarea.fecha) {
            const fechaTarea = new Date(tarea.fecha);

            if (!Number.isNaN(fechaTarea.getTime())) {
                if (masProxima === null || fechaTarea < new Date(masProxima.fecha)) {
                    masProxima = tarea;
                }
            }
        }
    }

    const porcentajeAlta = (prioridadAlta / lista.length) * 100;

    console.log(`Total: ${lista.length} tareas`);
    console.log(`Pendientes: ${pendientes}`);
    console.log(`Prioridad alta: ${prioridadAlta} (${porcentajeAlta.toFixed(1)}%)`);
    console.log(`Horas totales: ${totalHoras} (media: ${(totalHoras / lista.length).toFixed(1)} h por tarea)`);

    if (masProxima !== null) {
        console.log(`Fecha más próxima: ${masProxima.nombre ?? "Sin nombre"} (${masProxima.fecha})`);
    } else {
        console.log("No hay tareas con una fecha válida");
    }
}

// ----------------------------------------------------
// 8. ORDENAR (no modifica el array original)
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
// 9. TARJETAS EN LA PÁGINA
// ----------------------------------------------------
function crearTarjeta(tarea) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta", "tarjeta-" + tarea.categoria.replaceAll(" ", "-"));

    const titulo = document.createElement("h3");
    titulo.textContent = tarea.nombre.trim();

    const detalle = document.createElement("p");
    detalle.textContent =
        `Responsable: ${tarea.responsable} | Prioridad: ${tarea.prioridad} | ` +
        `Estado: ${tarea.estado} | Fecha: ${tarea.fecha} | Horas: ${tarea.horas}`;

    tarjeta.append(titulo, detalle);
    return tarjeta;
}

function pintar(coleccion, textoBuscado = "") {
    const contenedor = document.querySelector("#contenedor");
    const resumen = document.querySelector("#resumen");

    contenedor.innerHTML = "";

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

    const r = recuentoPorPrioridad(coleccion);
    resumen.textContent =
        `Mostrando ${coleccion.length} de ${tareas.length} tareas. ` +
        `Alta: ${r.alta} | Media: ${r.media} | Baja: ${r.baja}`;
}

// ----------------------------------------------------
// 10. ACTUALIZAR: buscar -> filtrar -> ordenar -> pintar
// ----------------------------------------------------
function actualizar() {
    const texto = document.querySelector("#buscador").value;

    let lista = buscarPorTexto(texto);                                  // 1. buscar
    lista = filtrar(lista, {                                            // 2. filtrar
        prioridad: document.querySelector("#filtroPrioridad").value,
        estado: document.querySelector("#filtroEstado").value,
        horasMin: Number(document.querySelector("#filtroHoras").value) || 0
    });
    if (orden.campo) {
        lista = ordenar(lista, orden.campo, orden.tipo, orden.asc);     // 3. ordenar
    }
    pintar(lista, texto);                                               // 4. pintar
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
// 11. EVENTOS
// ----------------------------------------------------
document.querySelector("#buscador").addEventListener("input", actualizar);
document.querySelector("#filtroPrioridad").addEventListener("change", actualizar);
document.querySelector("#filtroEstado").addEventListener("change", actualizar);
document.querySelector("#filtroHoras").addEventListener("input", actualizar);
document.querySelector("#btnTexto").addEventListener("click", () => cambiarOrden("nombre", "texto"));
document.querySelector("#btnNumero").addEventListener("click", () => cambiarOrden("id", "numero"));
document.querySelector("#btnHoras").addEventListener("click", () => cambiarOrden("horas", "numero"));

// ----------------------------------------------------
// 12. DATOS Y LLAMADAS (sin id: lo calcula anadirTarea)
// ----------------------------------------------------
anadirTarea({
    nombre: "aplicacion javascript", categoria: "javascript",
    fecha: "2026-10-07", prioridad: "alta", estado: "pendiente", responsable: "Angel", horas: 8
});

anadirTarea({
    nombre: "aplicacion html", categoria: "html",
    fecha: "2026-10-09", prioridad: "media", estado: "terminada", responsable: "Angel", horas: 5
});

anadirTarea({
    nombre: "aplicacion php", categoria: "php",
    fecha: "2026-10-12", prioridad: "baja", estado: "pendiente", responsable: "Luis", horas: 2
});

anadirTarea({
    nombre: "aplicacion web", categoria: "web",
    fecha: "2026-10-14", prioridad: "alta", estado: "pendiente", responsable: "Marta", horas: 4
});

anadirTarea({
    nombre: "aplicacion sniffing", categoria: "ciberseguridad",
    fecha: "2026-10-15", prioridad: "media", estado: "pendiente", responsable: "Angel", horas: 6
});

anadirTarea({
    nombre: "aplicacion reconocimiento", categoria: "ciberseguridad",
    fecha: "2026-10-16", prioridad: "alta", estado: "terminada", responsable: "Luis", horas: 9
});

anadirTarea({
    nombre: "despliegue aplicacion web", categoria: "web",
    fecha: "2026-10-20", prioridad: "media", estado: "pendiente", responsable: "Marta", horas: 10
});

anadirTarea({
    nombre: "creacion bbdd", categoria: "base de datos",
    fecha: "2026-10-22", prioridad: "alta", estado: "pendiente", responsable: "Angel", horas: 12
});

anadirTarea({
    nombre: "monitorizacion server", categoria: "monitorizacion",
    fecha: "2026-10-25", prioridad: "baja", estado: "terminada", responsable: "Luis", horas: 1
});

anadirTarea({
    nombre: "rellenar tabla html", categoria: "html",
    fecha: "2026-10-28", prioridad: "baja", estado: "pendiente", responsable: "Marta", horas: 3
});

// ----------------------------------------------------
// 13. Expresiones regulares para referencia y fecha
// ----------------------------------------------------

const REFERENCIA = /^[A-Z]{3}-\d{3}$/; // Con esta expresión regular lo que hacemos es buscar por el nombre de la tarea que tanto sea en mayúsculas y en minúsculas
const FECHA = /^\d{4}-\d{2}-\d{2}$/; // Con esta expresión regular lo que hacemos es buscar por fecha pero lo hacemos buscando en el formato indicado

// ----------------------------------------------------
// 14. COOKIES (guardan el último orden elegido)
// ----------------------------------------------------
function guardarCookie(nombre, valor, dias) {
    document.cookie =
        `${nombre}=${encodeURIComponent(valor)}; max-age=${dias * 24 * 60 * 60}; path=/; SameSite=Lax`;
}
 
function leerCookie(nombre) {
    const par = document.cookie.split("; ").find(c => c.startsWith(nombre + "="));
    return par ? decodeURIComponent(par.slice(nombre.length + 1)) : null;
}
 
function guardarOrden() {
    guardarCookie("orden", JSON.stringify({ campo: orden.campo, asc: orden.asc }), 30);
}
 
// Lee la cookie y, si es válida, la aplica a la variable orden
function cargarOrdenGuardado() {
    const texto = leerCookie("orden");
    if (texto === null) return;
 
    try {
        const guardado = JSON.parse(texto);
        // Solo aceptamos campos conocidos (no nos fiamos del contenido de la cookie)
        if (Object.hasOwn(CAMPOS_ORDEN, guardado.campo)) {
            orden = {
                campo: guardado.campo,
                tipo: CAMPOS_ORDEN[guardado.campo],
                asc: guardado.asc !== false
            };
        }
    } catch {
        console.warn("La cookie de orden no es válida; se ignora.");
    }
}
 
// ----------------------------------------------------
// 15. FECHAS
// ----------------------------------------------------
 
// "2026-06-12" -> objeto Date en hora local (evita el desfase de zona horaria de new Date("2026-06-12"))
function fechaDesdeISO(iso) {
    const [anio, mes, dia] = iso.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
}
 
// Date -> "AAAA-MM-DD"
function aISO(fecha) {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}
 
// "2026-06-12" -> "12 de junio de 2026"
function formatearFecha(iso) {
    return fechaDesdeISO(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
 
// ¿La fecha está entre hace un mes y hoy?
function esDelUltimoMes(iso) {
    const fecha = fechaDesdeISO(iso);
 
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
 
    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
 
    return fecha >= haceUnMes && fecha <= hoy;
}
 
// Fecha de hace N días en formato AAAA-MM-DD (para que los datos de prueba
// siempre tengan unas tareas recientes y otras antiguas)
function fechaRelativa(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return aISO(fecha);
}
 
// ----------------------------------------------------
// 16. VALIDAR TAREA (devuelve un texto de error, o "" si todo está bien)
// ----------------------------------------------------
function validarTarea(datos) {
    if (typeof datos.nombre !== "string" || datos.nombre.trim() === "") {
        return "El nombre no puede estar vacío.";
    }
 
    if (!Object.hasOwn(contadorCategoria, datos.categoria)) {
        return "La categoría no es válida.";
    }
 
    if (typeof datos.responsable !== "string" || datos.responsable.trim() === "") {
        return "El responsable no puede estar vacío.";
    }
 
    // Campo validado con expresión regular
    if (!REGEX_REFERENCIA.test(datos.referencia)) {
        return "La referencia debe tener 3 letras mayúsculas, un guion y 3 números (ejemplo: TAR-001).";
    }
 
    if (tareas.some(t => t.referencia === datos.referencia)) {
        return `La referencia ${datos.referencia} ya existe.`;
    }
 
    // Fecha en formato AAAA-MM-DD y que exista de verdad (no vale 2026-02-31)
    if (!REGEX_FECHA.test(datos.fecha) || aISO(fechaDesdeISO(datos.fecha)) !== datos.fecha) {
        return "La fecha no es válida.";
    }
 
    if (typeof datos.horas !== "number" || Number.isNaN(datos.horas) || datos.horas < 0) {
        return "Las horas deben ser un número igual o mayor que 0.";
    }
 
    return "";
}

listar();
estadisticas(tareas);
console.table(buscarPorTexto("Luis"));
actualizar(); // pintado inicial