// js/gestorTareas.js
import { Tarea } from "./tarea.js";
import { buscarPorTexto, anadir } from "./logica.js";

export class GestorTareas {
    constructor(tareas) {
        this._tareas = tareas;
    }

    // B2: crea una instancia de Tarea por cada objeto y devuelve un gestor nuevo
    static desdeDatos(datos) {
        const tareas = [];
        for (const d of datos) {
            tareas.push(new Tarea(d));
        }
        return new GestorTareas(tareas);
    }

    get total() {
        return this._tareas.length;
    }

    // Devuelve una copia: quien la reciba no puede modificar la lista interna
    listar() {
        return [...this._tareas];
    }

    // Devuelve el id asignado, o null si la tarea no es válida
    anadir(tarea) {
        return anadir(this._tareas, tarea);
    }

    // true si la elimina; false si el id no existe
    eliminar(id) {
        const indice = this._tareas.findIndex(t => t.id === id);
        if (indice === -1) return false;
        this._tareas.splice(indice, 1);
        return true;
    }

    buscar(texto) {
        return buscarPorTexto(this._tareas, texto);
    }
}