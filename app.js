const http = require('http');
const fs = require('fs');
const port = 3000;

// static Content
const header = '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<title>simpleHTTP server</title>' +
    '</head>' +
    '<body>';

const footer = '</body>' +
    '</html>';

/////////////////////////////

// sends 200 and head tag
const sendHeader = (response) => {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.write(header);
}

// sends end body&html tags and close response
const sendFooter = (response) => {
    response.write(footer);
    response.end();
}

// list a folder and prints him as table
const listFolder = (path) => {
    return fs.readdirSync(path, 'utf8').map((f) => {
        return `<a href="${f}">${f}</a>`
    }).join('<br />');
};

// send the file
const sendFile = (filePath, response) => {
    fs.readFile(filePath, "binary", (err, file) => {
        if (err) {
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write(err + "\n");
            response.end();
            return;
        }

        response.writeHead(200);
        response.write(file, "binary");
        response.end();
    });
};

/////////////////////////////

const requestHandler = (request, response) => {
    console.log(decodeURIComponent(request.url));

    if (request.url === '/') {
        sendHeader(response);
        response.write('<h1>Welcome!</h1>');
        sendFooter(response);
    } else {
        // remove first character('/') from request and translate/decode the URI 
        let requestedUrlParsed =  decodeURIComponent(request.url.substr(1)); 
        fs.stat(requestedUrlParsed, (err, stats) => {
            if (err) { // 404
                sendHeader(response);
                response.write('<h1>Not Found</h1>');
                response.write('<p>The requested URL ' + request.url + ' was not found on this server.</p>');
                response.write('<hr>');
                response.write('<p><i>simpleHTTP Server. Made with <3 and NodeJS by <a href="http://github.com/deblanco/">Daniel Blanco Parla</a></i>.</p>');
                sendFooter(response);
                return;
            }
            // file or directory exists!
            if (stats.isFile()) {
                sendFile(requestedUrlParsed, response);
            } else {
                sendHeader(response);
                response.write('<h1>Index of ' + request.url + '</h1>');
                response.write(listFolder(requestedUrlParsed));
                sendFooter(response);
            }
        });
    }
    return;
};

const server = http.createServer(requestHandler);
server.listen(port, (err) => {
    if (err) return console.log('something bad happened', err);
    console.log('server is listening on ' + port)
});