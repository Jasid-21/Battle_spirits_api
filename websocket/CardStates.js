const { findSocket } = require('../helpers/functions');

function cardStates(io, socket) {
    socket.on('rest_unrest', info => {
        const { card_id, place, op_id } = info;

        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        op_socket.emit('rest_unrest', { card_id, place });
    });

    socket.on('flip_burst_card', info => {
        const op_id = info.op_id;
        
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        op_socket.emit('flip_burst_card', info);
    });

    socket.on('refresh_all', ({ player_org, op_id }) => {
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('refresh_all', { player_org });
        socket.emit('refresh_all', { player_org });
    });

    socket.on('reveal_cards', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('reveal_cards', info);
    });
}

module.exports = cardStates;
