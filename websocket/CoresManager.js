const { findSocket, createCode } = require('../helpers/functions');
const { Core } = require('../helpers/classes');

function coresManager(io, socket) {
    socket.on('move_cores', info => {
        const op_id = info.op_id;

        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        op_socket.emit('move_cores', info);
    });

    socket.on('increment_cores', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        const core = new Core(createCode(5));
        socket.emit('increment_cores', {...info, core});
        op_socket.emit('increment_cores', {...info, core});
    });
}

module.exports = coresManager;
