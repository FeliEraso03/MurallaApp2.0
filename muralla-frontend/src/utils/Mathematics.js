export class Mathematics {
    /**
     * Calcula la distancia entre dos puntos utilizando la fórmula de Haversine.
     * @param {number} lat1 - Latitud del primer punto.
     * @param {number} lon1 - Longitud del primer punto.
     * @param {number} lat2 - Latitud del segundo punto.
     * @param {number} lon2 - Longitud del segundo punto.
     * @returns {number} - Distancia entre los dos puntos en metros.
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        var radLat1 = (Math.PI * lat1) / 180;
        var radLat2 = (Math.PI * lat2) / 180;
        var theta = lon1 - lon2;
        var radTheta = (Math.PI * theta) / 180;
        var distance =
            Math.sin(radLat1) * Math.sin(radLat2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        distance = Math.acos(distance);
        distance = (distance * 180) / Math.PI;
        distance = distance * 60 * 1.1515 * 1.609344;
        return distance;
    }

    /**
     * Calcula las coordenadas de una flecha en una línea entre dos puntos.
     * Se usa para determinar el polígono de dirección de una arista.
     * @param {Array<number>} startPoint - Coordenadas del punto de inicio [lat, lng].
     * @param {Array<number>} endPoint - Coordenadas del punto final [lat, lng].
     * @param {number} arrowSize - Tamaño de la flecha.
     * @returns {Array<Array<number>>} - Coordenadas del triángulo de la flecha [middlePoint, arrowPoint1, arrowPoint2].
     */
    static calculateEdgeDistance(startPoint, endPoint, arrowSize = 0.00009) {
        var dx = endPoint[0] - startPoint[0];
        var dy = endPoint[1] - startPoint[1];
        var angle = Math.atan2(dy, dx);
        
        // El punto medio donde se dibujará la "cabeza" de la flecha
        var middlePoint = [
            startPoint[0] + dx / 2,
            startPoint[1] + dy / 2,
        ];
        
        // Puntos de la base del triángulo/flecha
        var arrowPoint1 = [
            middlePoint[0] - arrowSize * Math.cos(angle - Math.PI / 6),
            middlePoint[1] - arrowSize * Math.sin(angle - Math.PI / 6),
        ];
        var arrowPoint2 = [
            middlePoint[0] - arrowSize * Math.cos(angle + Math.PI / 6),
            middlePoint[1] - arrowSize * Math.sin(angle + Math.PI / 6),
        ];

        return [middlePoint, arrowPoint1, arrowPoint2];
    }
}
