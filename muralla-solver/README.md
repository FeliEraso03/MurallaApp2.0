# Muralla Solver Service

Servicio P-Graph Solver con integración Wine para ejecutar binarios de Windows en contenedores Linux.

## Arquitectura

Este servicio implementa el algoritmo WDG2PNS que procesa estructuras factibles generadas por el motor matemático externo P-Graph.

### Componentes

- **server.js**: Servidor Express que recibe GeoJSON y procesa el grafo
- **WDG2PNSv2.jar**: Archivo Java que preprocesa el grafo para el solver
- **pgraph_solver.exe**: Ejecutable de Windows del solver P-Graph (ejecutado vía Wine)
- **DLLs**: Librerías de Windows necesarias para el ejecutable

## Flujo de Operación

1. **Entrada**: Recibe GeoJSON vía POST a `/upload-geojson`
2. **Extracción**: Extrae nodos (tipo 1 = origen, tipo 3 = destino) y aristas
3. **Preprocesamiento**: Ejecuta WDG2PNSv2.jar para generar archivo .in
4. **Solver**: Ejecuta pgraph_solver.exe vía Wine con archivo .in
5. **Salida**: Retorna resultado del solver (formato texto plano)

## Variables de Entorno

- `COPY_DIR`: Directorio para archivos temporales (default: `/app/copy`)
- `JAR_FILE`: Ruta al archivo JAR (default: `/app/WDG2PNSv2.jar`)
- `EXE_FILE`: Ruta al ejecutable (default: `/app/pgraph_solver.exe`)
- `PORT`: Puerto del servidor (default: `3000`)

## API

### POST /upload-geojson

Cuerpo del request:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [...] },
      "properties": { "id": "Node1", "type": 1 }
    },
    ...
  ]
}
```

Respuesta:
```json
{
  "message": "Proceso completado exitosamente",
  "output": "Feasible structure #1: ..."
}
```

## Docker

### Construir y ejecutar

```bash
docker-compose up solver
```

### Ejecutar solo el servicio

```bash
docker-compose build solver
docker-compose up -d solver
```

## Integración con Backend Spring Boot

El backend puede llamar al servicio solver vía HTTP:

```java
RestTemplate restTemplate = new RestTemplate();
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
HttpEntity<GeoJSON> request = new HttpEntity<>(geojson, headers);
ResponseEntity<SolverResponse> response = restTemplate.postForEntity(
    "http://solver:3000/upload-geojson", 
    request, 
    SolverResponse.class
);
```

## Notas

- El servicio requiere Wine para ejecutar el binario de Windows
- El primer inicio puede ser lento debido a la inicialización de Wine
- Asegúrese de que el GeoJSON tenga nodos con tipos 1 (origen) y 3 (destino)
