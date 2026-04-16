const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const cors = require('cors');
const app = express();

const copyDir = process.env.COPY_DIR || '/app/copy';
const sourcesFilePath = path.join(copyDir, 'sources.txt');
const linksFilePath = path.join(copyDir, 'arcs.txt');
const fnkyFilePath = path.join(copyDir, 'sinks.txt');
const jarFilePath = process.env.JAR_FILE || '/app/WDG2PNSv2.jar';
const inFilePath = path.join(copyDir, 'arcs.in');
const outFilePath = path.join(copyDir, 'arcs.out');
const wineExePath = process.env.EXE_FILE || '/app/pgraph_solver.exe';

if (!fs.existsSync(copyDir)) {
    fs.mkdirSync(copyDir, { recursive: true });
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/upload-geojson', (req, res) => {
    const geojson = req.body;

    if (!geojson || !geojson.features) {
        console.error('Error: GeoJSON inválido o vacío.');
        return res.status(400).json({ error: 'GeoJSON inválido o vacío.' });
    }

    console.log('GeoJSON recibido correctamente.');

    const nodes = geojson.features.filter(f => f.geometry.type === 'Point');
    const edges = geojson.features.filter(f => f.geometry.type === 'LineString');

    let sourceNode = null;
    let fnkyNode = null;
    const links = [];

    const nodeRegex = /^Node\d+$/;

    nodes.forEach(node => {
        const nodeId = node.properties.id;
        const nodeType = parseInt(node.properties.type, 10);

        if (!nodeRegex.test(nodeId)) return;

        if (nodeType === 1 && !sourceNode) {
            sourceNode = nodeId;
        }

        if (nodeType === 3) {
            fnkyNode = nodeId;
        }
    });

    console.log('Total de aristas:', edges.length);
    edges.forEach((edge, index) => {
        const { startNodeId, endNodeId, distance } = edge.properties;
        console.log(`Arista ${index}: startNodeId=${startNodeId}, endNodeId=${endNodeId}, distance=${distance}`);
        if (nodeRegex.test(startNodeId) && nodeRegex.test(endNodeId) && distance !== undefined) {
            links.push(`${startNodeId};${endNodeId};${distance}`);
        }
    });
    console.log('Aristas válidas encontradas:', links.length);

    try {
        if (sourceNode) {
            fs.writeFileSync(sourcesFilePath, sourceNode + '\n');
            console.log('Archivo sources.txt generado.');
        } else {
            console.error('Error: No se encontró nodo tipo 1.');
        }

        if (links.length > 0) {
            fs.writeFileSync(linksFilePath, links.join('\n') + '\n');
            console.log('Archivo arcs.txt generado.');
        } else {
            console.error('Error: No se encontraron aristas válidas.');
        }

        if (fnkyNode) {
            fs.writeFileSync(fnkyFilePath, fnkyNode + '\n');
            console.log('Archivo sinks.txt generado.');
        } else {
            console.error('Error: No se encontró nodo tipo 3.');
        }

        if (fs.existsSync(jarFilePath)) {
            const jarCommand = `java -jar ${jarFilePath} arcs.txt sources.txt sinks.txt`;
            console.log('Ejecutando comando:', jarCommand);

            exec(jarCommand, { cwd: copyDir }, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error al ejecutar el .jar:', err);
                    return res.status(500).json({ error: 'Error al ejecutar el archivo .jar' });
                }

                console.log('Salida del WDG2PNSv2.jar:\n', stdout);

                if (!fs.existsSync(inFilePath)) {
                    console.error('Error: No se generó el archivo arcs.in');
                    return res.status(500).json({ error: 'No se generó arcs.in' });
                }

                const wineCommand = `wine ${wineExePath} INSIDEOUT arcs.in arcs.out 100`;
                console.log('Ejecutando Wine:', wineCommand);

                exec(wineCommand, { cwd: copyDir }, (err, stdoutWine, stderrWine) => {
                    if (err) {
                        console.error('Error al ejecutar Wine:', err);
                        return res.status(500).json({ error: 'Error al ejecutar Wine' });
                    }

                    console.log('Wine ejecutado correctamente.');

                    if (!fs.existsSync(outFilePath)) {
                        console.error('Error: No se generó el archivo arcs.out');
                        return res.status(500).json({ error: 'No se generó arcs.out' });
                    }

                    const outContent = fs.readFileSync(outFilePath, 'utf8');
                    console.log(outContent)

                    res.status(200).json({
                        message: 'Proceso completado exitosamente',
                        output: outContent
                    });
                });
            });
        } else {
            console.error('Error: WDG2PNSv2.jar no encontrado.');
            res.status(500).json({ error: 'WDG2PNSv2.jar no encontrado en la carpeta' });
        }
    } catch (err) {
        console.error('Error al generar archivos:', err);
        res.status(500).json({ error: 'Error al generar archivos de texto' });
    }
});

const puerto = process.env.PORT || 3000;
app.listen(puerto, async() => {
    console.log('Servidor Express ejecutándose en el puerto', puerto);
    const openModule = await
    import ('open');
    openModule.default(`http://localhost:${puerto}/index.html`);
});