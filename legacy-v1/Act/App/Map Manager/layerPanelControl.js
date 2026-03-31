export class LayerPanelControl {
    constructor(map) {
        this.map = map;
        this.layerPanel;
        this.idCounter = 4;
        this.idGraphLayer = 1;
    }

    setLayerPanel(layerPanel) {
        this.layerPanel = layerPanel;
        this.initControls();
    }

    initControls() {
        this.addEventListenersIfNotBound();

        const addLayerButton = this.layerPanel.querySelector(
            '.cssbuttons-io-button'
        );
        addLayerButton.addEventListener('click', () => {
            this.layerPanel
                .querySelector('.drop__container')
                .appendChild(this.createDropCard());
            this.addEventListenersIfNotBound();
        });
    }

    addEventListenersIfNotBound() {
        const rangeInputs = this.layerPanel.querySelectorAll('.sliderlp');

        rangeInputs.forEach((rangeInput) => {
            if (!rangeInput.hasAttribute('data-event-bound')) {
                rangeInput.addEventListener('input', (event) => {
                    console.log(
                        `ID: ${event.target.id}, Valor: ${event.target.value}`
                    );
                });
                rangeInput.setAttribute('data-event-bound', 'true');
            }
        });

        const checkboxes = this.layerPanel.querySelectorAll(
            '.checkbox-wrapper input[type="checkbox"]'
        );

        checkboxes.forEach((checkbox) => {
            if (!checkbox.hasAttribute('data-event-bound')) {
                checkbox.addEventListener('change', (event) => {
                    console.log(
                        `ID: ${event.target.id}, Estado: ${event.target.checked}`
                    );
                });
                checkbox.setAttribute('data-event-bound', 'true');
            }
        });
    }

    createDropCard() {
        const currentId = this.idCounter++;

        const dropCard = document.createElement('div');
        dropCard.classList.add('drop__card');

        const dropData = document.createElement('div');
        dropData.classList.add('drop__data');

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        svg.setAttribute('style', 'margin-right: 5px;');
        svg.setAttribute('class', 'grab');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.innerHTML = `
        <path fill-rule="evenodd" clip-rule="evenodd"
            d="M5 4C5.55228 4 6 3.55228 6 3C6 2.44772 5.55228 2 5 2C4.44772 2 4 2.44772 4 3C4 3.55228 4.44772 4 5 4ZM6 8C6 8.55228 5.55228 9 5 9C4.44772 9 4 8.55228 4 8C4 7.44772 4.44772 7 5 7C5.55228 7 6 7.44772 6 8ZM6 13C6 13.5523 5.55228 14 5 14C4.44772 14 4 13.5523 4 13C4 12.4477 4.44772 12 5 12C5.55228 12 6 12.4477 6 13ZM12 8C12 8.55228 11.5523 9 11 9C10.4477 9 10 8.55228 10 8C10 7.44772 10.44772 7 11 7C11.5523 7 12 7.44772 12 8ZM11 14C11.5523 14 12 13.5523 12 13C12 12.4477 11.5523 12 11 12C10.4477 12 10 12.4477 10 13C10 13.5523 10.4477 14 11 14ZM12 3C12 3.55228 11.5523 4 11 4C10.4477 4 10 3.55228 10 3C10 2.44772 10.44772 2 11 2C11.5523 2 12 2.44772 12 3Z"
            fill="currentColor"></path>
    `;

        const img = document.createElement('img');
        img.setAttribute('src', '/img/grafo.png');
        img.setAttribute('alt', '');
        img.classList.add('drop__img');

        const textContainer = document.createElement('div');

        const h1 = document.createElement('h1');
        h1.classList.add('drop__name');
        h1.textContent = `Graph ${this.idGraphLayer++}`;

        const rangeInput = document.createElement('input');
        rangeInput.setAttribute('id', `myRange${currentId}`);
        rangeInput.setAttribute('class', 'sliderlp');
        rangeInput.setAttribute('value', '100');
        rangeInput.setAttribute('max', '100');
        rangeInput.setAttribute('min', '0');
        rangeInput.setAttribute('type', 'range');

        textContainer.appendChild(h1);
        textContainer.appendChild(rangeInput);

        dropData.appendChild(svg);
        dropData.appendChild(img);
        dropData.appendChild(textContainer);

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.classList.add('checkbox-wrapper');

        const checkbox = document.createElement('input');
        checkbox.setAttribute('id', `_checkbox-${currentId}`);
        checkbox.setAttribute('type', 'checkbox');

        const label = document.createElement('label');
        label.setAttribute('for', `_checkbox-${currentId}`);

        const tickMark = document.createElement('div');
        tickMark.classList.add('tick_mark');

        label.appendChild(tickMark);
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);

        dropCard.appendChild(dropData);
        dropCard.appendChild(checkboxWrapper);

        return dropCard;
    }
}
