const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Fehler beim Laden der Datei.');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        });
    } else {
        res.statusCode = 404;
        res.end('Seite nicht gefunden.');
    }
});

server.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
})