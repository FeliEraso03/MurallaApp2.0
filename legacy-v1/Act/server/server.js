const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

app.use('/App', express.static(path.join(__dirname, '../App')));

app.use(express.static(path.join(__dirname, '../LandingPage')));

app.use(express.static(path.join(__dirname, '../assets')));

app.use('/archivos', express.static(path.join(__dirname, '../LandingPage/archivos')));

app.use('/img', express.static(path.join(__dirname, '../LandingPage/img')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../LandingPage/index.html'));
});

app.get('/App.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../App/App.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
