const http = require('http');

const server = http.createServer((req, res) => {

    res.setHeader('Content-Type', 'text/html');

    if (req.url === '/') {
        res.write('<h1>Home Page</h1>');
    } 
    else if (req.url === '/about') {
        res.write('<h1>About Page</h1>');
    } 
    else {
        res.write('<h1>404 Not Found</h1>');
    }

    res.end();
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});