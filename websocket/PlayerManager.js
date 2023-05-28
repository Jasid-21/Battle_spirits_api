const { findSocket } = require('../helpers/functions');

function playerManager(io, socket) {
    socket.on('looking_something', info => {
        const op_id = info.op_id;

        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        op_socket.emit('looking_something', info);
    });

    socket.on('change_phase', ({name, op_id}) => {
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('change_phase', { name });
    });

    socket.on('change_turn', ({ player_org, op_id }) => {
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('change_turn', { player_org });
    });

    socket.on('new_message', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('new_message', info);
    });
}

module.exports = playerManager;
