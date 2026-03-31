/**
 * Clase que representa una cola de prioridad.
 */
export class PriorityQueue {
    /**
     * Creamos una instancia de PriorityQueue.
     */
    constructor() {
        this.items = [];
    }

    /**
     * Agrega un elemento a la cola de prioridad.
     * @param {*} element - Elemento a agregar.
     * @param {number} priority - Prioridad del elemento.
     */
    enqueue(element, priority) {
        let queueElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(queueElement);
        }
    }

    /**
     * Elimina y devuelve el elemento de mayor prioridad de la cola.
     * @returns {*} El elemento de mayor prioridad.
     */
    dequeue() {
        return this.items.shift();
    }

    /**
     * Comprueba si la cola de prioridad está vacía.
     * @returns {boolean} true si la cola está vacía, false en caso contrario.
     */
    isEmpty() {
        return this.items.length === 0;
    }
}
