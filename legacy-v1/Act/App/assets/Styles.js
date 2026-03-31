document.addEventListener('DOMContentLoaded', function () {
    // Obtener el switch
    const switchBtn = document.getElementById('mode-toggle');

    // Función para alternar los botones visibles
    switchBtn.addEventListener('change', function () {
        // Obtener los botones originales
        const originalButtons = [
            document.getElementById('toggleGridButton'),
            document.getElementById('toggleHeatmapButton'),
            document.getElementById('routeCreationButton'),
        ];

        // Obtener los botones alternativos
        const altButtons = [
            document.getElementById('inputGroupFileAddon04'),
            document.getElementById('exportGraph'),
            document.getElementById('altButton3'),
            document.getElementById('altButton4'),
            document.getElementById('layerButton'),
            document.getElementById('SendButton'),
        ];

        // Alternar la visibilidad de los botones
        if (switchBtn.checked) {
            // Ocultar los botones originales
            originalButtons.forEach(
                (button) => (button.style.display = 'flex')
            );
            // Mostrar los botones alternativos
            altButtons.forEach((button) => (button.style.display = 'none'));
        } else {
            // Mostrar los botones originales
            originalButtons.forEach(
                (button) => (button.style.display = 'none')
            );
            // Ocultar los botones alternativos
            altButtons.forEach((button) => (button.style.display = 'flex'));
        }
    });
});

const offcanvasElement = document.getElementById('offcanvasScrolling');
const mainContent = document.querySelector('.main-content');

offcanvasElement.addEventListener('show.bs.offcanvas', () => {
    mainContent.classList.add('with-offcanvas');
});

offcanvasElement.addEventListener('hide.bs.offcanvas', () => {
    mainContent.classList.remove('with-offcanvas');
});
