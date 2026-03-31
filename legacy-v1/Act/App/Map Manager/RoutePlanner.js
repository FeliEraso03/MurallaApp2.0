import { Mathematics } from '../Mathematical Operations/Mathematics.js';
export class RoutePlanner {
    constructor(map) {
        this.map = map;
        this.markers = [];
        this.routeLayer = L.layerGroup(); 
        this.markerLayer = L.layerGroup();
        this.mainLayerGroup = L.layerGroup([this.routeLayer, this.markerLayer]).addTo(this.map);
        this.isRouteCreationEnabled = false;
        this.resetControlInstance = null;
    }

    onMapClick(e) {
        if (this.isRouteCreationEnabled && this.markers.length < 2) {
            const latLng = e.latlng;
            const blueIcon = L.icon({
                iconUrl: '/img/start.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            const redIcon = L.icon({
                iconUrl: '/img/end.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            const markerIcon = this.markers.length === 0 ? blueIcon : redIcon;
            const marker = L.marker(latLng, {
                draggable: true,
                icon: markerIcon,
            }).addTo(this.markerLayer); // Añadir a la capa de marcadores

            this.markers.push(marker);

            if (this.markers.length === 2) {
                this.toggleResetControl(true);
                this.calculateRoute(
                    this.markers[0].getLatLng(),
                    this.markers[1].getLatLng()
                );
            }

            marker.on('dragend', () => {
                if (this.markers.length === 2) {
                    this.calculateRoute(
                        this.markers[0].getLatLng(),
                        this.markers[1].getLatLng()
                    );
                }
            });
        }
    }

    toggleResetControl(create) {
        const context = this;
        if (create) {
            const resetControl = L.Control.extend({
                options: {
                    position: 'topright',
                },
                onAdd: function () {
                    const container = L.DomUtil.create(
                        'div',
                        'leaflet-bar leaflet-control leaflet-control-custom'
                    );

                    container.style.backgroundColor = 'white';
                    container.style.width = '34px';
                    container.style.height = '34px';
                    container.style.pointerEvents = 'auto';
                    container.style.cursor = 'pointer';
                    container.style.display = 'flex';
                    container.style.justifyContent = 'center';
                    container.style.alignItems = 'center';
                    container.innerHTML = '<i class="fas fa-trash"></i>';
                    container.onclick = () => {
                        context.resetRoute();
                        this.isRouteCreationEnabled = true;
                    };

                    return container;
                },
            });

            this.resetControlInstance = new resetControl();
            this.map.addControl(this.resetControlInstance);
        } else {
            if (this.resetControlInstance) {
                this.map.removeControl(this.resetControlInstance);
                this.resetControlInstance = null;
            }
        }
    }

    calculateRoute(start, end) {
        this.routeLayer.clearLayers(); 

        const apiKey = 'e0e0dc16-753a-457d-ac8b-a417f425309b';
        const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=foot&locale=en&key=${apiKey}&type=json&points_encoded=false`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const route = data.paths[0].points;
                const distance = data.paths[0].distance * 1000;
                const totalMinutes = data.paths[0].time / 1000 / 60;
                const minutes = Math.floor(totalMinutes);
                const seconds = Math.round((totalMinutes - minutes) * 60);

                const routeLayer = L.geoJSON(route, {
                    style: {
                        color: 'green',
                        weight: 5,
                        opacity: 0.7,
                    },
                }).addTo(this.routeLayer);  // Añadir la ruta a la capa

                const fetchPOI = (lat, lng) => {
                    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:25,${lat},${lng})[amenity];out;`;

                    fetch(overpassUrl)
                        .then((response) => response.json())
                        .then((poiData) => {
                            poiData.elements.forEach((poi) => {
                                if (poi.tags && poi.tags.amenity) {
                                    const smallIcon = L.icon({
                                        iconUrl: '/img/pin.png',
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 16],
                                        popupAnchor: [0, -16],
                                    });

                                    L.marker([poi.lat, poi.lon], {
                                        icon: smallIcon,
                                    })
                                        .addTo(this.routeLayer)  // Añadir POI a la capa
                                        .bindPopup(
                                            `<b>${
                                                poi.tags.name || 'POI'
                                            }</b><br>
                                             ${
                                                 poi.tags.amenity ||
                                                 'Tipo no especificado'
                                             }<br>
                                             ${
                                                 poi.tags['addr:street'] ||
                                                 poi.tags['addr:housenumber']
                                                     ? `${
                                                           poi.tags[
                                                               'addr:street'
                                                           ] || ''
                                                       } ${
                                                           poi.tags[
                                                               'addr:housenumber'
                                                           ] || ''
                                                       }<br>`
                                                     : ''
                                             }
                                             ${
                                                 poi.tags['addr:city'] ||
                                                 poi.tags['addr:postcode']
                                                     ? `${
                                                           poi.tags[
                                                               'addr:city'
                                                           ] || ''
                                                       } ${
                                                           poi.tags[
                                                               'addr:postcode'
                                                           ] || ''
                                                       }<br>`
                                                     : ''
                                             }
                                             ${
                                                 poi.tags['contact:phone']
                                                     ? `Teléfono: ${poi.tags['contact:phone']}<br>`
                                                     : ''
                                             }
                                             ${
                                                 poi.tags['contact:email']
                                                     ? `Email: <a href="mailto:${poi.tags['contact:email']}">${poi.tags['contact:email']}</a><br>`
                                                     : ''
                                             }
                                             ${
                                                 poi.tags.website
                                                     ? `<a href="${poi.tags.website}" target="_blank">Sitio web</a>`
                                                     : ''
                                             }`
                                        );
                                }
                            });
                        })
                        .catch((error) =>
                            console.error(
                                'Error al obtener POI de Overpass:',
                                error
                            )
                        );
                };

                this.generatePointsEvery10Meters(
                    route.coordinates
                ).points.forEach((coord, index) => {
                    fetchPOI(coord[1], coord[0]);
                });

                routeLayer.on('click', () => {
                    L.popup()
                        .setLatLng([start.lat, start.lng])
                        .setContent(
                            `
                            <b>Detalles de la Ruta:</b><br>
                            Distancia: ${(distance / 1000).toFixed(
                                2
                            )} metros<br>
                            Tiempo estimado: ${minutes} min ${seconds} seg
                        `
                        )
                        .openOn(this.routeLayer._map);
                });
            })
            .catch((error) =>
                console.error('Error al calcular la ruta a pie:', error)
            );
    }

    generatePointsEvery10Meters(route) {
        const interval = 25; 
        const points = [route[0]];

        for (let i = 1; i < route.length; i++) {
            const currentPoint = route[i - 1];
            const nextPoint = route[i];

            const segmentDistance = Mathematics.calculateDistance(
                currentPoint[1],
                currentPoint[0],
                nextPoint[1],
                nextPoint[0]
            );

            const numIntermediatePoints = Math.floor(
                segmentDistance / interval
            );

            for (let j = 1; j <= numIntermediatePoints; j++) {
                const ratio = (j * interval) / segmentDistance;

                const interpolatedPoint = [
                    currentPoint[0] + ratio * (nextPoint[0] - currentPoint[0]),
                    currentPoint[1] + ratio * (nextPoint[1] - currentPoint[1]),
                ];

                points.push(interpolatedPoint);
            }

            points.push(nextPoint);
        }

        return { points };
    }

    resetRoute() {
        this.isRouteCreationEnabled = false;
        this.toggleResetControl(false);
        this.mainLayerGroup.clearLayers();
        this.markers = [];
        this.routeLayer = L.layerGroup(); 
        this.markerLayer = L.layerGroup();
        this.mainLayerGroup = L.layerGroup([this.routeLayer, this.markerLayer]).addTo(this.map);
    }
}
