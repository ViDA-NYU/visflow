// Javascript Imports
const path = require("path");
const grpc = require("grpc");
const WebSocketServer = require("ws").Server;

// Environment variables for GRPC
let GRPC_PORT = process.env.GRPC_PORT
let GRPC_HOST = process.env.GRPC_HOST
let GRPC_CONN_URL = GRPC_HOST+ ":" +GRPC_PORT

// Websocket defs
let wss = new WebSocketServer({port: 8888});

// Loading proto files
let core = grpc.load(path.join(__dirname, "ta3ta2_api", "core.proto"), 'proto', {enumsAsStrings:false});
let data_ext = grpc.load(path.join(__dirname, "ta3ta2_api", "data_ext.proto"), 'proto', {enumsAsStrings:false});
let dataflow_ext = grpc.load(path.join(__dirname, "ta3ta2_api", "dataflow_ext.proto"), 'proto', {enumsAsStrings:false});

// Creating the GRPC Connections
let connections = [];
connections.push( {stub: new core.Core(GRPC_CONN_URL, grpc.credentials.createInsecure()), module: core} );
connections.push( {stub: new data_ext.DataExt(GRPC_CONN_URL, grpc.credentials.createInsecure()), module: data_ext} );
connections.push( {stub: new dataflow_ext.DataflowExt(GRPC_CONN_URL, grpc.credentials.createInsecure()), module: dataflow_ext} );

function toObj(message){
    let ret = {};
    console.log(message)
    keys = Object.keys(message);
    keys.forEach(k => {
        if (typeof message[k] === "object" && message[k] !== null)
            ret[k] = toObj(message[k]);
        else
            ret[k] = message[k];
    });
    return ret;
}

// Websocket relay server
wss.on("connection", function(ws) {
    ws.on("message", function(str_message) {
    	let message = JSON.parse(str_message);
    	let parameter = message["object"]
    	let rid = message['rid']
    	let fname = message["fname"];
    	fname = fname[0].toLowerCase() + fname.substr(1);
    	connections.forEach(conn => {
            if ( fname in conn["stub"] ) {
                // call method
                let responseClass = conn["module"][conn["stub"][fname].responseType.name];
                if (conn["stub"][fname].responseStream === true){
                    // streaming response
                    let call = conn["stub"][fname](parameter);
                    call.on('data', function(response){
                        response = new responseClass(response);
                        ws.send(JSON.stringify({'rid':rid, 'object': response}))
                    })
                } else {
                    // single message response
                    conn["stub"][fname](parameter, function(err, response){
                        if (err) {
                            console.log("ERROR: " + err)
                        } else {
                            response = new responseClass(response);
                            ws.send(JSON.stringify({'rid':rid, 'object': response}))
                        }
                    });
                }    
            } // if (fname in conn)
        }); //connections.forEach
    }); //ws.on("message")
});
