export class Mathematics {
    /**
     * Calcular la distancia en metros entre dos puntos geográficos utilizando la fórmula del haversine.
     * @param {number} lat1 - Latitud del primer punto en grados.
     * @param {number} lon1 - Longitud del primer punto en grados.
     * @param {number} lat2 - Latitud del segundo punto en grados.
     * @param {number} lon2 - Longitud del segundo punto en grados.
     * @returns {number} La distancia en metros entre los dos puntos geográficos.
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        // Radio de la Tierra en metros
        const R = 6371e3;
        // Convierte las latitudes y longitudes de grados a radianes
        const phi1 = this.degreesToRadians(lat1);
        const phi2 = this.degreesToRadians(lat2);
        const deltaPhi = this.degreesToRadians(lat2 - lat1);
        const deltaLambda = this.degreesToRadians(lon2 - lon1);

        // Calcula la distancia utilizando la fórmula del haversine
        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) *
                Math.cos(phi2) *
                Math.sin(deltaLambda / 2) *
                Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Devuelve la distancia en metros
    }

    static degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    static calculateEdgeDistance(startPoint, endPoint, arrowLength) {
        // Calcula la dirección de la línea
        var lineDirection = Math.atan2(
            endPoint[1] - startPoint[1],
            endPoint[0] - startPoint[0]
        );

        // Punto medio de la línea
        var middlePoint = [
            (startPoint[0] + endPoint[0]) / 2,
            (startPoint[1] + endPoint[1]) / 2,
        ];

        // Punto base de la flecha en el punto medio
        var arrowBaseMiddle = [
            middlePoint[0] + arrowLength * 0.5 * Math.cos(lineDirection),
            middlePoint[1] + arrowLength * 0.5 * Math.sin(lineDirection),
        ];

        // Ángulo para los puntos de la punta de la flecha
        var angleOffset = Math.PI / 6; // Ángulo de 30 grados

        // Puntos de la punta de la flecha
        var arrowPoint1 = [
            arrowBaseMiddle[0] -
                arrowLength * Math.cos(lineDirection - angleOffset), // Cambio de signo para invertir la dirección
            arrowBaseMiddle[1] -
                arrowLength * Math.sin(lineDirection - angleOffset), // Cambio de signo para invertir la dirección
        ];
        var arrowPoint2 = [
            arrowBaseMiddle[0] -
                arrowLength * Math.cos(lineDirection + angleOffset), // Cambio de signo para invertir la dirección
            arrowBaseMiddle[1] -
                arrowLength * Math.sin(lineDirection + angleOffset), // Cambio de signo para invertir la dirección
        ];

        return [middlePoint, arrowPoint1, arrowPoint2];
    }
}