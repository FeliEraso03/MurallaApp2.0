import React, { useEffect, useRef } from 'react';

/**
 * MapLabels - Motor de etiquetas robusto para MurallaApp
 * Maneja POIs estáticos de Cartagena y dinámicos de Overpass.
 * Se sincroniza con el mapa cada vez que cambia el estilo (styledata).
 */
export const MapLabels = ({ map, isVisible }) => {
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 15;
  const RETRY_DELAY = 300;

  // 1. Datos estáticos de Cartagena
  const cartagenaPOIFeatures = [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.549218, 10.422979] }, properties: { name: 'Torre del Reloj', type: 'monumento' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.551322, 10.421711] }, properties: { name: 'Plaza San Pedro Claver', type: 'plaza' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.551407, 10.422688] }, properties: { name: 'Palacio de la Inquisición', type: 'museo' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.551065, 10.422956] }, properties: { name: 'Plaza de Bolívar', type: 'plaza' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.551529, 10.423189] }, properties: { name: 'Plaza Santo Domingo', type: 'plaza' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5462, 10.4209] }, properties: { name: 'Barrio Getsemaní', type: 'cultura' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.544674, 10.421867] }, properties: { name: 'Plazuela de la Trinidad', type: 'plaza' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.546457, 10.430153] }, properties: { name: 'Las Bóvedas', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.540456, 10.422503] }, properties: { name: 'Castillo de San Felipe', type: 'monumento' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.525547, 10.411131] }, properties: { name: 'Mercado de Bazurto', type: 'cultura' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5539, 10.4248] }, properties: { name: 'Baluarte de Santo Domingo', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5493, 10.4277] }, properties: { name: 'Baluarte de Santiago Apóstol', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5507, 10.4261] }, properties: { name: 'Teatro Adolfo Mejía', type: 'cultura' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5504, 10.4231] }, properties: { name: 'Catedral de Santa Catalina', type: 'iglesia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5530, 10.4208] }, properties: { name: 'Parque de la Marina', type: 'parque' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5460, 10.4220] }, properties: { name: 'Parque Centenario', type: 'parque' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5484, 10.4217] }, properties: { name: 'Muelle de los Pegasos', type: 'monumento' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5431, 10.4267] }, properties: { name: 'India Catalina', type: 'monumento' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5394, 10.4228] }, properties: { name: 'Zapatos Viejos', type: 'monumento' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5512, 10.4214] }, properties: { name: 'Museo de Arte Moderno', type: 'museo' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5524, 10.4211] }, properties: { name: 'Museo Naval del Caribe', type: 'museo' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5483, 10.4269] }, properties: { name: 'Iglesia de Santo Toribio', type: 'iglesia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5256, 10.4192] }, properties: { name: 'Convento de la Popa', type: 'iglesia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5499, 10.4283] }, properties: { name: 'Casa de García Márquez', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5491, 10.4229] }, properties: { name: 'Plaza de los Coches', type: 'plaza' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5515, 10.4211] }, properties: { name: 'Baluarte de San Ignacio', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5529, 10.4208] }, properties: { name: 'Baluarte de San Francisco Javier', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5500, 10.4219] }, properties: { name: 'Plaza de la Aduana', type: 'plaza' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5493, 10.4229] }, properties: { name: 'Portal de los Dulces', type: 'historia' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-75.5485, 10.4222] }, properties: { name: 'Camellón de los Mártires', type: 'monumento' } },
  ];

  const robustSync = () => {
    if (!map) return;

    // Si el estilo no está listo, re-intentamos en unos ms
    if (!map.isStyleLoaded()) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(robustSync, RETRY_DELAY);
        console.log(`[MapLabels] Estilo no listo, re-intento ${retryCountRef.current}/${MAX_RETRIES}`);
      }
      return;
    }

    // Ya estamos aquí, reiniciamos el contador de re-intentos para la próxima vez
    retryCountRef.current = 0;

    // Solo procedemos si es visible (Mapa Oscuro)
    if (!isVisible) {
      try {
        if (map.getLayer('cartagena-poi-labels')) map.setLayoutProperty('cartagena-poi-labels', 'visibility', 'none');
        if (map.getLayer('osm-dynamic-poi-labels')) map.setLayoutProperty('osm-dynamic-poi-labels', 'visibility', 'none');
      } catch (e) {}
      return;
    }

    try {
      // --- 1. Cartagena POIs ---
      if (!map.getSource('cartagena-pois')) {
        map.addSource('cartagena-pois', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: cartagenaPOIFeatures }
        });
      }
      if (!map.getLayer('cartagena-poi-labels')) {
        map.addLayer({
          id: 'cartagena-poi-labels',
          type: 'symbol',
          source: 'cartagena-pois',
          layout: {
            'text-field': '{name}',
            'text-font': ['Noto Sans Bold', 'Noto Sans Regular'],
            'text-size': 13,
            'text-anchor': 'bottom',
            'text-offset': [0, -1],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'visibility': 'visible'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': [
              'match', ['get', 'type'],
              'monumento', '#f77f00',
              'plaza',     '#3a86ff',
              'museo',     '#8338ec',
              'historia',  '#ffbe0b',
              'cultura',   '#fb5607',
              'iglesia',   '#06d6a0',
              'parque',    '#70e000',
              '#f77f00'
            ],
            'text-halo-width': 1.8,
            'text-halo-blur': 1,
          }
        });
      } else {
        map.setLayoutProperty('cartagena-poi-labels', 'visibility', 'visible');
      }

      // --- 2. Dynamic POIs (Overpass) ---
      if (window._murallaOverpassCache) {
        if (!map.getSource('osm-dynamic-pois')) {
          map.addSource('osm-dynamic-pois', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: window._murallaOverpassCache }
          });
        }
        if (!map.getLayer('osm-dynamic-poi-labels')) {
          map.addLayer({
            id: 'osm-dynamic-poi-labels',
            type: 'symbol',
            source: 'osm-dynamic-pois',
            minzoom: 12,
            layout: {
              'text-field': '{name}',
              'text-font': ['Noto Sans Regular'],
              'text-size': 11,
              'text-anchor': 'bottom',
              'text-offset': [0, -0.5],
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'visibility': 'visible'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#023e8a', 
              'text-halo-width': 1.6
            }
          });
        } else {
          map.setLayoutProperty('osm-dynamic-poi-labels', 'visibility', 'visible');
          // Actualizamos datos si han cambiado (redundancia)
          const src = map.getSource('osm-dynamic-pois');
          if (src) src.setData({ type: 'FeatureCollection', features: window._murallaOverpassCache });
        }
      }
    } catch (err) {
      console.warn('[MapLabels] Error sincronizando capas:', err);
      // Si falla por algo raro, intentamos una vez más en breve
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(robustSync, RETRY_DELAY);
      }
    }
  };

  // Efecto de inicialización y respuesta a cambios de estilo
  useEffect(() => {
    if (!map) return;

    // Escuchamos múltiples señales de "listo"
    map.on('load', robustSync);
    map.on('styledata', robustSync);
    map.on('idle', robustSync);
    
    // Ejecución inmediata inicial
    retryCountRef.current = 0;
    robustSync();

    return () => {
      map.off('load', robustSync);
      map.off('styledata', robustSync);
      map.off('idle', robustSync);
    };
  }, [map, isVisible]);

  // Manejo de Fetch inicial para Overpass (si no hay caché)
  useEffect(() => {
    if (window._murallaOverpassCache) return;

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|cafe|bar|pharmacy"](10.415,-75.555,10.430,-75.540);
        node["tourism"~"museum|hotel|hostel|viewpoint"](10.415,-75.555,10.430,-75.540);
        node["shop"~"gift|clothes|souvenir|mall"](10.415,-75.555,10.430,-75.540);
      );
      out body;
    `;

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(overpassQuery)
    })
    .then(res => res.json())
    .then(data => {
      const dynamicFeatures = data.elements
        .filter(el => el.tags && el.tags.name)
        .map(el => {
          let categoryLabel = '[POI]';
          const tags = el.tags;
          
          if (tags.amenity === 'restaurant') { categoryLabel = '[Restaurante]'; }
          else if (tags.amenity === 'cafe' || tags.amenity === 'bar') { categoryLabel = '[Bar/Café]'; }
          else if (tags.amenity === 'pharmacy') { categoryLabel = '[Farmacia]'; }
          else if (tags.tourism === 'hotel' || tags.tourism === 'hostel') { categoryLabel = '[Hotel]'; }
          else if (tags.tourism === 'museum') { categoryLabel = '[Museo]'; }
          else if (tags.tourism === 'viewpoint') { categoryLabel = '[Mirador]'; }
          else if (tags.shop) { categoryLabel = '[Tienda]'; }

          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
            properties: { 
              name: `${categoryLabel} ${tags.name}`
            }
          };
        });
      window._murallaOverpassCache = dynamicFeatures;
      retryCountRef.current = 0;
      robustSync(); 
    })
    .catch(() => {});
  }, []);

  return null; // Componente headless
};
