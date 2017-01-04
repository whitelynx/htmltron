'use strict'

const path = require('path');
const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const uriSchemeRE = /^(https?|file):\/\//;

let windows = {};

var argv = require('yargs')
    .usage('Usage: $0 URI')
    .demandCommand(1)
    .describe('d', 'Show developer tools at startup')
    .boolean('d')
    .alias('d', 'devtools')
    .help('h')
    .alias('h', 'help')
    .argv;


function ensureWindow(uri) {
    console.log("ensureWindow(%j)", uri);
    if(!uriSchemeRE.test(uri)) {
        uri = 'file://' + path.resolve(uri);
    }

    if(windows[uri] !== undefined) { return; }

    console.log("Loading %s . . .", uri);
    windows[uri] = new BrowserWindow({ width: 800, height: 600 });
    windows[uri].loadURL(uri);

    if(argv.d) {
        windows[uri].webContents.openDevTools();
    }

    windows[uri].on('closed', function() {
        windows[uri] = undefined;
    });
}

electron.app.on('ready', function() {
    if(argv._.length === 0) {
        console.warn("No URIs given! Exiting.");
        electron.app.quit();
    } else {
        argv._.forEach(uri => {
            ensureWindow(uri);
        });
    }
});

electron.app.on('window-all-closed', function() {
    if(process.platform !== 'darwin') {
        electron.app.quit();
    }
});

electron.app.on('open-file', function(event, path) {
    event.preventDefault();

    if(path) {
        ensureWindow(path);
    } else {
        // On Windows, you have to parse process.argv (in the main process) to get the filepath.
        argv._.forEach(uri => {
            ensureWindow(uri);
        });
    }
});

electron.app.on('open-url', function(event, url) {
    event.preventDefault();

    ensureWindow(uri);
});


electron.app.on('activate', function() {
    //ensureWindow();
});
