//import L from 'leaflet';
//import '../../../node_modules/leaflet/dist/leaflet.css';

import { LayerPanelControl } from './layerPanelControl.js';
import { FileHandler } from '../Geojson Files/FileHandler.js';


const TILE_BASE_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_HUM_LAYER = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
const COPY =
    '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';


export class Map {

    constructor() {
        this.flag=false;
        this.soluciones=[];
        this.graphManager=null;
        this.centroHistorico = L.latLng(10.425248, -75.549548);
        this.southWest = L.latLng(10.425248 - 0.01, -75.549548 - 0.01);
        this.northEast = L.latLng(10.425248 + 0.01, -75.549548 + 0.01);
        this.bounds = L.latLngBounds(this.southWest, this.northEast);
        this.layerPanelControl = new LayerPanelControl();
        this.map = L.map('map', {
            center: this.centroHistorico,
            zoom: 16,
            maxBounds: this.bounds,
            maxZoom: 20,
            minZoom: 16,
            zoomControl: false,
            keyboard: true,
        });

        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        L.tileLayer(TILE_BASE_LAYER, { maxZoom: 20, attribution: COPY }).addTo(
            this.map
        );

        // Capa para la cuadrícula
        this.gridLayer = L.layerGroup().addTo(this.map);
        this.isGridVisible = false;

        // Capa para el mapa de calor
        this.heatmapLayer = L.layerGroup().addTo(this.map);
        this.isHeatMapVisible = false;

        // Estado de la animación del mapa de calor
        this.isAnimated = false;
        this.heatmapInterval = null;

        // Enlace de los métodos de la instancia
        this.updateGrid = this.updateGrid.bind(this);
        this.updateHeatmap = this.updateHeatmap.bind(this);
        this.adjustAndAddHeatmap = this.adjustAndAddHeatmap.bind(this);
    }

    /**
     * Actualiza la capa de la cuadrícula.
     */
    updateGrid() {
        this.gridLayer.clearLayers();
        this.zoomLimits();
        if (this.isGridVisible) {
            this.creatingGrid();
        }
    }

    /**
     * Actualiza la capa del mapa de calor.
     */
    updateHeatmap() {
        if (this.isHeatMapVisible) {
            this.adjustAndAddHeatmap();
        } else {
            this.heatmapLayer.clearLayers();
        }
    }

    /**
     * Cambia la visibilidad de la cuadrícula.
     */
    gridVisibility() {
        this.isGridVisible = !this.isGridVisible;
        this.updateGrid();
    }

    /**
     * Cambia la visibilidad del mapa de calor.
     */
    heatMapVisibility() {
        this.isHeatMapVisible = !this.isHeatMapVisible;
        this.updateHeatmap();
    }

    /**
     * Inicia o detiene la animación del mapa de calor.
     */
    playingAnimation() {
        this.isAnimated = !this.isAnimated;

        if (this.heatmapInterval) {
            clearInterval(this.heatmapInterval);
            this.heatmapInterval = null;
        } else {
            this.updateHeatmapPeriodically();
        }
    }

    /**
     * Aplicar límites de zoom al mapa.
     */
    zoomLimits() {
        if (this.map.getZoom() > 18 && !this.mapCape) {
            this.mapCape = true;
            this.baseLayer = L.tileLayer(TILE_HUM_LAYER, {
                maxZoom: 20,
                attribution: COPY,
            }).addTo(this.map);
        } else if (this.map.getZoom() <= 18 && this.mapCape) {
            this.mapCape = false;
            this.baseLayer.remove();
            this.baseLayer = L.tileLayer(TILE_BASE_LAYER, {
                maxZoom: 20,
                attribution: COPY,
            }).addTo(this.map);
        }
    }

    /**
     * Creación de la cuadrícula en el mapa.
     */
    creatingGrid() {
        this.gridLayer.clearLayers();
        let bounds = this.map.getBounds();
        let gridSizeX = 15,
            gridSizeY = 15;
        let topLeft = this.map.latLngToLayerPoint(bounds.getNorthWest());
        let bottomRight = this.map.latLngToLayerPoint(bounds.getSouthEast());

        for (
            let x = Math.floor(topLeft.x / gridSizeX) * gridSizeX;
            x < bottomRight.x;
            x += gridSizeX
        ) {
            for (
                let y = Math.floor(topLeft.y / gridSizeY) * gridSizeY;
                y < bottomRight.y;
                y += gridSizeY
            ) {
                let rectangleBounds = L.bounds(
                    L.point(x, y),
                    L.point(x + gridSizeX, y + gridSizeY)
                );
                let latLngBounds = L.latLngBounds(
                    this.map.layerPointToLatLng(rectangleBounds.min),
                    this.map.layerPointToLatLng(rectangleBounds.max)
                );
                L.rectangle(latLngBounds, {
                    color: '#ff7800',
                    weight: 1,
                    opacity: 0.3,
                    fillOpacity: 0,
                }).addTo(this.gridLayer);
            }
        }
    }

    /**
     * Ajusta y añade la capa del mapa de calor al mapa.
     */
    adjustAndAddHeatmap() {
        fetch('./Geojson Files/puntosCarretera.geojson')
            .then((response) => response.json())
            .then((geojson) => {
                var data = [];
                geojson.features.forEach((feature) => {
                    if (feature.geometry.type === 'Point') {
                        var coordinates = feature.geometry.coordinates;
                        var adjustedIntensity = this.adjustIntensity(
                            feature.properties.intensidad
                        );
                        data.push([
                            coordinates[1],
                            coordinates[0],
                            adjustedIntensity,
                        ]);
                    }
                });
                this.heatmapLayer.clearLayers();
                this.heatmapLayer.addLayer(L.heatLayer(data, { radius: 20 }));
            })
            .catch((error) =>
                console.error('Error loading GeoJSON file:', error)
            );
    }

    getFlag() {
        return this.flag;
    }


    /**
     * Ajusta la intensidad de los datos del mapa de calor.
     * @param {number} intensity - La intensidad de los datos.
     * @returns {number} - La intensidad ajustada.
     */
    adjustIntensity(intensity) {
        var randomValue = Math.random() * 2 - 1;
        var adjustedIntensity = Math.abs(intensity + randomValue);
        return adjustedIntensity;
    }

    addSoluciones(sol) {
        this.soluciones=sol;
    }

    getSoluciones(){
        return this.soluciones;
    }


    addGraphManager(graphMngr) {
        this.graphManager=graphMngr;
    }

    getGraphManager(){
        return this.graphManager;
    }


    /**
     * Actualiza periódicamente el mapa de calor.
     */
    updateHeatmapPeriodically() {
        this.heatmapInterval = setInterval(this.adjustAndAddHeatmap, 500);
    }

    addLocationControl(locations) {
        const existingControl = document.querySelector('.leaflet-control-locations');
        if (existingControl) {
          existingControl.remove();
        }

        //if(this.flag==false){
            const LocationControl = L.Control.extend({
            onAdd: function () {
                const div = L.DomUtil.create('div', 'leaflet-control-locations');
                div.innerHTML = `
                <label for="locationSelect"><strong>Path:</strong></label><br>
                <select id="locationSelect">
                    <option value="none">-- Select --</option>
                </select>
                `;
                // Prevent map interactions when interacting with the select
                L.DomEvent.disableClickPropagation(div);
                return div;
            },
            });
            this.flag=true;
        //} 

        const locationControl = new LocationControl({ position: 'topright' });
        this.map.addControl(locationControl);
    
        // Attach event after control is added to DOM
        setTimeout(() => {
            const select = document.getElementById('locationSelect');
        
            // 🆕 Dynamically add options
            locations.forEach(loc => {
              const option = document.createElement('option');
              //option.value = `${loc.lat},${loc.lng}`;
              option.value = `${loc.index}`;
              option.text = loc.name;
              select.appendChild(option);
            });
        
            select.addEventListener('change', (e) => {
              const value = e.target.value;
              if (value !== 'none') {
                //const [lat, lng] = value.split(',').map(Number);
                const index = value;
                console.log(index);
                //map.setView([lat, lng], 13);
                let soluciones = this.getSoluciones();
               
                const solucionActual = this.soluciones.soluciones.find((s) => s.solucion === Number(index));
                console.log(solucionActual);
                if (solucionActual) {
                    FileHandler.geojsonToGraphFromObject(solucionActual, this.getGraphManager());

                    this.graphManager.drawGraphMap();
                }

              }
            });
          }, 0);
    }
}
