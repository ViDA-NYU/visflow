// Javascript Imports
const path = require('path');
const grpc = require('grpc');
const WebSocketServer = require('ws').Server;

// Environment variables for GRPC
let GRPC_PORT = process.env.GRPC_PORT
let GRPC_HOST = process.env.GRPC_HOST
let GRPC_CONN_URL = GRPC_HOST+ ":" +GRPC_PORT

// Function to get methods from object
function getMethods(obj)
{
    var res = [];
    for(var m in obj) {
        if(typeof obj[m] === "function") {
            res.push(m)
        }
    }
    return res;
}

// Websocket defs
let wss = new WebSocketServer({port: 8888});

// Loading proto files
let core = grpc.load(path.join(__dirname, 'ta3ta2_api', 'core.proto'));
let data_ext = grpc.load(path.join(__dirname, 'ta3ta2_api', 'data_ext.proto'));
let dataflow_ext = grpc.load(path.join(__dirname, 'ta3ta2_api', 'dataflow_ext.proto'));

// Creating the GRPC Connection
let connections = [];
connections.push( {'stub': new core.Core(GRPC_CONN_URL, grpc.credentials.createInsecure())} );
connections.push( {'stub': new data_ext.DataExt(GRPC_CONN_URL, grpc.credentials.createInsecure())} );
connections.push( {'stub': new dataflow_ext.DataflowExt(GRPC_CONN_URL, grpc.credentials.createInsecure())} );

connections.forEach(conn => {
    conn['methods'] = getMethods(conn['stub'])
});

// Websocket relay server
wss.on('connection', function(ws) {
    ws.on('message', function(str_message) {
    	let message = JSON.parse(str_message);
    	let fname = message["fname"];
    	fname = fname[0].toLowerCase() + fname.substr(1);
    	client[fname](message['object'])
    });
});
