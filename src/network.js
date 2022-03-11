import Peer from 'peerjs';

let peerId;
let handlers = {id: [], connected:[]};
const registerHandler = (type, handler) => {
    handlers[type].push(handler);
}

const peer = new Peer();
let conn;
function setupConn(c) {
    if (conn) return;
    conn = c;
    c.on('data', (data) => {
        console.log('data');
        console.log(data);
        if (data < 10) {
            c.send(++data);
        }
    });
    handlers.connected.forEach((h) => h(conn));
}

peer.on('open', (id) => {
    peerId = id;
    handlers.id.forEach((h) => h(id));
});
peer.on('connection', (conn) => {
    setupConn(conn);
});


function connect(targetId) {
    if (conn) return;
    
    const _conn = peer.connect(targetId, {serialization: "json"});
    _conn.on('open', ()=>{
        _conn.send(0);
    })
    setupConn(_conn);
}

// DONT NEED BC CONNECTED HANDLER PASSES CONN??????????
// function sendData(data) {
//     if (!conn) return;
//     conn.send(data);
// }

export { registerHandler, connect, /*sendData*/ };
