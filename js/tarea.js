// js/tarea.js
export class Tarea {
    constructor(datos) {
        this.nombre = datos.nombre;          // pasa por el setter: se valida
        this.id = datos.id;                  // pasa por el setter: se valida
        this.referencia = datos.referencia;  // solo existe en las tareas del formulario
        this.categoria = datos.categoria;
        this.fecha = datos.fecha;
        this.prioridad = datos.prioridad;
        this.estado = datos.estado;
        this.responsable = datos.responsable;
    }

    // --- id (campo numérico): getter + setter con validación ---
    get id() {
        return this._id;
    }

    set id(valor) {
        if (typeof valor !== "number" || Number.isNaN(valor) || valor <= 0) {
            throw new Error(`Id no válido en «${this._nombre ?? "sin nombre"}»: ${valor}`);
        }
        this._id = valor;
    }

    // --- extra: el nombre no puede estar vacío ---
    get nombre() {
        return this._nombre;
    }

    set nombre(valor) {
        if (typeof valor !== "string" || valor.trim() === "") {
            throw new Error(`Nombre no válido en la tarea con id ${datosId(this)}: «${valor}»`);
        }
        this._nombre = valor;
    }

    // --- getter que calcula un texto: "vence en 12 días", "venció hace 3 días"... ---
    get plazoTexto() {
        const MS_DIA = 24 * 60 * 60 * 1000;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const dias = Math.round((new Date(this.fecha + "T00:00:00") - hoy) / MS_DIA);

        if (Number.isNaN(dias)) return "fecha no válida";
        if (dias === 0) return "vence hoy";
        if (dias === 1) return "vence mañana";
        if (dias > 1) return `vence en ${dias} días`;
        if (dias === -1) return "venció ayer";
        return `venció hace ${Math.abs(dias)} días`;
    }

    // --- método que devuelve la descripción de la tarjeta ---
    descripcion() {
        const prefijoRef = this.referencia ? `Ref: ${this.referencia} | ` : "";
        return `${prefijoRef}Responsable: ${this.responsable} | Prioridad: ${this.prioridad} | Estado: ${this.estado} | ${this.plazoTexto}`;
    }
}

// Auxiliar: el id aún puede no existir cuando falla el nombre en el constructor
function datosId(tarea) {
    return tarea._id ?? "(sin asignar)";
}