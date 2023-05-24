const { findSocket } = require('../helpers/functions')

function movementManager(io, socket) {
    socket.on('draw_card', ({ op_id, num }) => {
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('draw_card', { player_org: socket.id, num });
    });
    
    socket.on('move_card', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('move_card', info);
    });
    
    socket.on('return_to_deck', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        
        op_socket.emit('return_to_deck', info);
    });
}

module.exports = movementManager;
