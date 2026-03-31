// Código existente...
import { Map } from './Map Manager/Map.js';
import { initMapControls } from './Map Manager/MapControls.js';
import { GraphManager } from './Graph Manager/GraphManager.js';
import { RoutePlanner } from './Map Manager/RoutePlanner.js';

document.addEventListener('DOMContentLoaded', () => {

    const mapInstance = new Map();
    const routePlannerInstance = new RoutePlanner(mapInstance.map);

    mapInstance.map.on('moveend', () => mapInstance.updateGrid());
    mapInstance.map.on('zoomend', () => mapInstance.updateGrid());


    const graphManager = new GraphManager(mapInstance.map);
    graphManager.routePlanner = routePlannerInstance;
    initMapControls(mapInstance, graphManager);

    mapInstance.map.on('click', function (e) {
        routePlannerInstance.onMapClick(e);
        graphManager.e = e;
        graphManager.createNodeByUnid();
    });
});
