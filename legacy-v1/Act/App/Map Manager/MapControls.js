import { FileHandler } from '../Geojson Files/FileHandler.js';
import { Dijkstra } from '../Graph Manager/Dijkstra.js';
import { FordFulkerson } from '../Graph Manager/FordFulkerson.js';
import { DraggableWindow } from '../assets/DraggableWindow.js';
import { Graph } from '../Graph Manager/Graph.js';
import { WDG2PNS } from '../Graph Manager/WDG2PNS.js';
import { initLayerPanel } from '../assets/LayerPanel/layerPanel.js';

/**
 * Función para inicializar los controles del mapa.
 * @param {Map} map - Instancia del mapa Leaflet.
 * @param {GraphManager} graphManager - Instancia del administrador del grafo.
 */
export function initMapControls(map, graphManager) {
    const toggleGridButton = document.getElementById('toggleGridButton');
    toggleGridButton.addEventListener('click', () => {
        map.gridVisibility();
        toggleGridButton.innerHTML = map.isGridVisible
            ? '<i class="fas fa-eye-slash"></i> <span>Hide Grid</span>'
            : '<i class="fas fa-eye"></i> <span>Show Grid</span>';
    });

    const routeCreationButton = document.getElementById('routeCreationButton');
    routeCreationButton.addEventListener('click', () => {
        routeCreationButton.innerHTML = graphManager.routePlanner
            .isRouteCreationEnabled
            ? '<i class="fas fa-road"></i> <span>Routes</span>'
            : '<i class="fas fa-bookmark"></i> <span>Routes</span>';
        if (graphManager.routePlanner.isRouteCreationEnabled) {
            graphManager.routePlanner.isRouteCreationEnabled = false;
            graphManager.routePlanner.resetRoute();
        } else {
            graphManager.routePlanner.isRouteCreationEnabled = true;
        }
    });

    const toggleHeatmapButton = document.getElementById('toggleHeatmapButton');
    let floatingWindowHeatmap;
    toggleHeatmapButton.addEventListener('click', () => {
        map.heatMapVisibility();
        if (map.isAnimated) {
            map.playingAnimation();
        }
        toggleHeatmapButton.innerHTML = map.isHeatMapVisible
            ? '<i class="fas fa-thermometer-half"></i> <span>Hide Heat Layer</span>'
            : '<i class="fas fa-fire"></i> <span>Show Heat Layer</span>';

        if (!floatingWindowHeatmap) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/App/assets/LayerPanel/layerPanel.css';
            cssLink.id = 'layerPanelCSS';

            cssLink.onload = function () {
                fetch('assets/heatmapMovement/heatmapMovement.html')
                    .then((response) => response.text())
                    .then((data) => {
                        if (!document.getElementById('floatingWindowHeatmap')) {
                            floatingWindowHeatmap =
                                document.createElement('div');
                            floatingWindowHeatmap.classList.add(
                                'floating-window-heatmap'
                            );
                            floatingWindowHeatmap.setAttribute(
                                'id',
                                'floatingWindowHeatmap'
                            );
                            floatingWindowHeatmap.innerHTML = data;
                            document.body.appendChild(floatingWindowHeatmap);
                            DraggableWindow.makeWindowDraggable(
                                floatingWindowHeatmap
                            );

                            const closeFloatingWindowButton =
                                floatingWindowHeatmap.querySelector(
                                    '#closeButtonHeatmapM'
                                );
                            closeFloatingWindowButton.addEventListener(
                                'click',
                                () => {
                                    toggleHeatmapButton.click();
                                    /*document.body.removeChild(floatingWindow);
                                floatingWindow = null;
                                if(map.isAnimated){
                                    map.playingAnimation();
                                }
                                map.heatMapVisibility();*/
                                }
                            );

                            const reproducirHeatmapButton =
                                floatingWindowHeatmap.querySelector(
                                    '#reproducirHeatmapButton'
                                );

                            reproducirHeatmapButton.addEventListener(
                                'click',
                                () => {
                                    map.playingAnimation();
                                    reproducirHeatmapButton.innerHTML =
                                        map.isAnimated
                                            ? '<i class="fas fa-pause"></i> '
                                            : '<i class="fas fa-play"></i>';
                                }
                            );
                        }
                    })
                    .catch((error) =>
                        console.error(
                            'Error al cargar reproductor.html:',
                            error
                        )
                    );
            };
            document.head.appendChild(cssLink);

            if (cssLink.sheet) {
                cssLink.onload();
            }
        } else {
            document.body.removeChild(floatingWindowHeatmap);
            floatingWindowHeatmap = null;
        }
    });

    const layerButton = document.getElementById('layerButton');
    let layerVisible = false;
    let floatingWindowLayerPanel;
    layerButton.addEventListener('click', () => {
        layerVisible = !layerVisible;
        layerButton.innerHTML = layerVisible
            ? '<i class="fa-solid fa-list"></i><span>Layers</span>'
            : '<i class="fa-solid fa-layer-group"></i><span>Layers</span>';

        if (!floatingWindowLayerPanel) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/App/assets/LayerPanel/layerPanel.css';
            cssLink.id = 'layerPanelCSS';

            cssLink.onload = function () {
                fetch('assets/Layerpanel/layerPanel.html')
                    .then((response) => response.text())
                    .then((data) => {
                        if (
                            !document.getElementById('floatingWindowLayerPanel')
                        ) {
                            floatingWindowLayerPanel =
                                document.createElement('div');
                            floatingWindowLayerPanel.classList.add(
                                'floating-window-layerpanel'
                            );
                            floatingWindowLayerPanel.setAttribute(
                                'id',
                                'floatingWindowLayerPanel'
                            );
                            floatingWindowLayerPanel.innerHTML = data;
                            document.body.appendChild(floatingWindowLayerPanel);
                            map.layerPanelControl.setLayerPanel(floatingWindowLayerPanel);
                            DraggableWindow.makeWindowDraggable(
                                floatingWindowLayerPanel
                            );

                            const closeFloatingWindowButton = floatingWindowLayerPanel.querySelector(
                                '#closeButtonLayerPanel'
                            );
                            closeFloatingWindowButton.addEventListener('click', () => {
                                layerButton.click();
                            });

                            initLayerPanel();

                            const dropItems =
                                document.getElementById('drop-items');
                            new Sortable(dropItems, {
                                animation: 350,
                                chosenClass: 'sortable-chosen',
                                dragClass: 'sortable-drag',
                                handle: '.grab',
                                store: {
                                    set: (sortable) => {
                                        const order = sortable.toArray();
                                        localStorage.setItem(
                                            'dropDataOrder',
                                            order.join('|')
                                        );
                                    },
                                    get: () => {
                                        const order =
                                            localStorage.getItem(
                                                'dropDataOrder'
                                            );
                                        return order ? order.split('|') : [];
                                    },
                                },
                            });

                        }
                    })
                    .catch((error) =>
                        console.error(
                            'Error al cargar reproductor.html:',
                            error
                        )
                    );
            };
            document.head.appendChild(cssLink);

            if (cssLink.sheet) {
                cssLink.onload();
            }
        } else {
            if (floatingWindowLayerPanel.style.display === 'none') {
                floatingWindowLayerPanel.style.display = 'block';
            } else {
                floatingWindowLayerPanel.style.display = 'none';
            }
        }
    });

    const graphSwitchCheckbox = document.getElementById('graphSwitch');
    const resultDiv = document.getElementById('resultadito');
    graphSwitchCheckbox.addEventListener('change', function () {
        if (this.checked) {
            graphManager.graphControls.toggleGraphCreation();
            graphManager.allow_display();
            resultDiv.innerHTML = ``;
        } else {
            graphManager.graphCreationEnabled = false;
        }
    });

    const directedGraph = document.getElementById('dirigidoCheckbox');
    directedGraph.addEventListener('change', function () {
        graphManager.directedGraph = this.checked;
        graphManager.drawGraphMap();
    });

    const editCheckbox = document.getElementById('editCheckbox');
    editCheckbox.addEventListener('change', function () {
        graphManager.graphControls.toggleEdit();
        resultDiv.innerHTML = ``;
        graphManager.allow_display();
    });

    let selectedFile = null;
    const fileInput = document.getElementById('loadGraph');
    const selectFileButton = document.getElementById('inputGroupFileAddon04');
    selectFileButton.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', async function (event) {
        const file = event.target.files[0];
        selectedFile = event.target.files[0];
        if (!file) {
            return;
        }
        await FileHandler.geojsonToGraph(file, graphManager);
        graphManager.drawGraphMap();
    });

    const exportGraphButton = document.getElementById('exportGraph');
    exportGraphButton.addEventListener('click', function () {
        FileHandler.graphToGeojson(graphManager.graph);
    });

    const clearGraphButton = document.getElementById('ClearGraph');
    clearGraphButton.addEventListener('click', function () {
        window.location.reload(true);
    });

    const dijkstraAlgorithm = document.getElementById('dijkstraAlgorithm');
    dijkstraAlgorithm.addEventListener('click', function () {
        if (!graphManager.fordFulkersonEnable) {
            graphManager.dijkstraEnable = !graphManager.dijkstraEnable;
            console.log(graphManager.dijkstraEnable);
            if (graphManager.dijkstraEnable) {
                alert('Select two nodes, then press start.');
                graphManager.graphControls.toggleGraphCreationAndEditing(false);
            } else {
                graphManager.graphControls.toggleGraphCreationAndEditing(true);
                graphManager.selectNodesAlgorim.forEach((node) =>
                    node.layer.setStyle({ fillColor: '#ff7800' })
                );
                graphManager.selectNodesAlgorim = [];
                graphManager.selectNodes = [];
            }
        }
    });

    const dijkstraCollapse = document.getElementById('djastra-collapse');
    const startAlgorithm = document.getElementById('startAlgorithm');
    startAlgorithm.addEventListener('click', async function () {
        if (graphManager.selectNodesAlgorim.length === 2) {
            const dijkstra = new Dijkstra(graphManager);
            let grafoAux = FileHandler.graphToGeojson(
                graphManager.graph,
                false
            );
            let graphGeoJSON = await dijkstra.seeDijkstra(grafoAux);
            await FileHandler.Graphdijkstra(graphGeoJSON, graphManager);
            graphManager.drawGraphMap();
            graphManager.dijkstraEnable = false;
            graphManager.disableSelection = false;
            graphManager.selectNodesAlgorim.forEach((node) =>
                node.layer.setStyle({ fillColor: '#ff7800' })
            );
            graphManager.selectNodesAlgorim = [];
            graphManager.selectNodes = [];
            graphManager.graphControls.toggleGraphCreationAndEditing(true);
            dijkstraCollapse.classList.remove('show');
        } else {
            alert('Please select two nodes, then press start.');
        }
    });

    /*let currentSolutionIndex = 0;
    const showSolutionsButton = document.getElementById('showSolutionsButton');
    showSolutionsButton.addEventListener('click', function () {
        const subgrafos = fordFulkerson.createSubgraphsFromPaths();
        if (subgrafos.length === 0) {
            alert('No solutions available.');
            return;
        }
        currentSolutionIndex = (currentSolutionIndex + 1) % subgrafos.length;
        const currentSolution = subgrafos[currentSolutionIndex];
        fordFulkerson.updateGraphState(currentSolution);
    });*/

    const fordFulkersonAlg = document.getElementById('FordFulkersonAlg');
    fordFulkersonAlg.addEventListener('click', async function () {
        graphManager.fordFulkersonEnable = !graphManager.fordFulkersonEnable;
        if (graphManager.fordFulkersonEnable) {
            if (!graphManager.dijkstraEnable) {
                alert('Select two nodes, then press start.');
                graphManager.graphControls.toggleGraphCreationAndEditing(false);
            }
        } else {
            graphManager.graphControls.toggleGraphCreationAndEditing(true);
            graphManager.selectNodesAlgorim.forEach((node) =>
                node.layer.setStyle({ fillColor: '#ff7800' })
            );
            graphManager.selectNodesAlgorim = [];
            graphManager.selectNodes = [];
        }
    });

    let fordFulkerson = null;
    const fordfulkersonCollapse = document.getElementById(
        'fordfulkerson-collapse'
    );
    const startFordFulkersonButton =
        document.getElementById('startFordFulkerson');
    startFordFulkersonButton.addEventListener('click', async function () {
        if (graphManager.selectNodesAlgorim.length === 2) {
            /*if (icon.classList.contains('fa-play')) {
                fordFulkerson = new FordFulkerson(graphManager);
                fordFulkerson.startAlg();
                icon.classList.remove('fa-play');
                icon.classList.add('fa-check');

            } else {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-play');
                graphManager.allow_display();
            }*/
            fordFulkerson = new FordFulkerson(graphManager);
            fordFulkerson.startAlg();
            graphManager.drawGraphMap();
            graphManager.fordFulkersonEnable = false;
            graphManager.disableSelection = false;
            graphManager.selectNodesAlgorim = [];
            graphManager.selectNodes = [];
            graphManager.graphControls.toggleGraphCreationAndEditing(true);
            fordfulkersonCollapse.classList.remove('show');
        } else {
            alert('Please select two nodes, then press start.');
        }
    });


    const sendButton = document.getElementById('SendButton');
    sendButton.addEventListener('click', async function () {
        let geoJson = FileHandler.graphToGeojson(graphManager.graph, false);
        let StringOut = '';
        console.log(geoJson);
        try {
            const response = await fetch('http://localhost:3000/upload-geojson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(geoJson),
            });
            if (response.ok) {
                const responseData = await response.json();
                StringOut = responseData;
                alert(`Respuesta del servidor receptor: ${responseData}`);
              } else {
                alert('Error al enviar el archivo GeoJSON.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al conectar con el servidor.');
            return;
        }

        const wdg2pns = new WDG2PNS(graphManager);
       	 //wdg2pns.doCleanPaths(responseData);
       
        const locations = [];
        let soluciones = wdg2pns.outToGeoJson(StringOut.output, geoJson);
        let currentIndex = 1;
        let j=1;
              console.log(`HERExxx ${soluciones.soluciones.length}`); 
             for (let i = 0; i < soluciones.soluciones.length; i++) {
                //const s = soluciones.soluciones[i];
                //if (s.solucion === currentIndex) {
                //const solucionActual = s;
                // do something with solucionActual
                //console.log(`Single ${soluciones.soluciones.index[i]}`); 
                locations.push({name: `Solution ${j+i}`,index: (i+j)});
                //} 
            }
        
                     
          
	   // Add the ComboBox with dynamic options
       map.addSoluciones(soluciones);
       map.addGraphManager(graphManager);
	    map.addLocationControl(locations);
    });
}