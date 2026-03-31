export class GraphControls {
    /**
     * Constructor de la clase GraphControls.
     * @param {Object} graph - Objeto que representa el grafo.
     */
    constructor(graph) {
        this.graph = graph;
        this.modalElement = document.createElement('div');
        this.modalElement.id = 'dataModal';
        this.modalElement.className = 'modal fade';
        this.modalElement.tabIndex = '-1';
        this.modalElement.setAttribute('role', 'dialog');
        document.body.appendChild(this.modalElement);
    }

    /**
     * Muestra un modelo con los campos especificados.
     * @param {string} title - Título del modelo.
     * @param {Array} fields - Array de objetos que representan los campos del formulario.
     * @param {Function} onSave - Callback para guardar los cambios.
     * @param {Function} onDelete - Callback para eliminar el elemento.
     * @param {boolean} showDeleteButton - Indica si se debe mostrar el botón de eliminar.
     */
    showModal(title, fields, onSave, onDelete, showDeleteButton = false) {
        const deleteButtonHTML = showDeleteButton
            ? `<button type="button" class="btn btn-danger delete-btn">Delete Element</button>`
            : '';

        const modalHTML = `
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${fields
                            .map(
                                (field) => `
                            <div class="form-group">
                                <label>${field.label}</label>
                                <input type="${
                                    field.type
                                }" class="form-control" id="${
                                    field.id
                                }" value="${field.value || ''}">
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    <div class="modal-footer">
                        ${deleteButtonHTML}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary save-btn">Save Changes</button>
                    </div>
                </div>
            </div>`;

        this.modalElement.innerHTML = modalHTML;

        // Manejamos el evento de guardar cambios.
        $('.save-btn', this.modalElement).on('click', () => {
            const data = fields.reduce((acc, field) => {
                acc[field.id] = $(`#${field.id}`, this.modalElement).val();
                return acc;
            }, {});
            onSave(data);
            $(this.modalElement).modal('hide');
        });

        // Manejamos el evento de eliminar elemento.
        $('.delete-btn', this.modalElement).on('click', () => {
            onDelete();
            $(this.modalElement).modal('hide');
        });

        $(this.modalElement).modal('show');
    }

    /**
     * Activar o desactivar la creación de grafos.
     */
    toggleGraphCreation() {
        this.graph.graphCreationEnabled =
            document.getElementById('graphSwitch').checked;
        var editCheckbox = document.getElementById('editCheckbox');
        editCheckbox.checked = false;
        this.graph.editEnabled = false;
    }

    /**
     * Activar o desactivar el modo de edición del grafo.
     */
    toggleEdit() {
        this.graph.editEnabled =
            document.getElementById('editCheckbox').checked;
        var graphSwitch = document.getElementById('graphSwitch');
        graphSwitch.checked = false;
        this.graph.graphCreationEnabled = false;
    }

    toggleGraphCreationAndEditing(isEnabled) {
        var editCheckbox = document.getElementById('editCheckbox');
        var graphSwitch = document.getElementById('graphSwitch');
        if (isEnabled) {
            editCheckbox.disabled = false;
            graphSwitch.disabled = false;
        } else {
            editCheckbox.disabled = true;
            editCheckbox.checked = false;
            this.graph.editEnabled = false;
            graphSwitch.disabled = true;
            graphSwitch.checked = false;
            this.graph.graphCreationEnabled = false;
        }
    }

    /**
     * Mostramos un tooltip con los atributos de un nodo.
     * @param {Object} node - Nodo del grafo.
     */
    showNodeAttributes(node) {
        const nodeData = node.nodeData;
        const tooltipContent = `
            <b>ID:</b> ${nodeData.id}<br>
            <b>Latitude:</b> ${nodeData.lat.toFixed(6)}<br>
            <b>Longitude:</b> ${nodeData.lng.toFixed(6)}<br>
            <b>Type:</b> ${nodeData.type}<br>
            <b>Initial Content:</b> ${nodeData.initialContent}<br>
            <b>Maximum Capacity:</b> ${nodeData.maximumCapacity}
        `;
        node.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'right',
            className: 'node-tooltip',
            sticky: true,
        }).openTooltip();
    }

    /**
     * Mostramos un tooltip con los atributos de una arista.
     * @param {Object} edge - Arista del grafo.
     */
    showEdgeAttributes(edge) {
        const edgeData = edge.edgeData;
        const tooltipContent = `
            <b>Start Node ID:</b> ${edgeData.startNodeId}<br>
            <b>End Node ID:</b> ${edgeData.endNodeId}<br>
            <b>Weight:</b> ${edgeData.weight}<br>
            <b>Capacity:</b> ${edgeData.capacity}<br>
            <b>Time:</b> ${edgeData.time}<br>
            <b>Distance:</b> ${edgeData.distance.toFixed(2)} metros
        `;
        edge.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'right',
            className: 'edge-tooltip',
            sticky: true,
        }).openTooltip();
    }
}
