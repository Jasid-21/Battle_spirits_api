const { findSocket, shuffleArray } = require('../helpers/functions');

function deckManager(io, socket) {
    socket.on('reveal_top', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('reveal_top', info);
    });

    socket.on('multi_return_to_bottom', info => {
        const op_id = info.op_id;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        op_socket.emit('multi_return_to_bottom', info);
    });

    socket.on('shuffle_deck', info => {
        const deck = info.deck;
        const op_id = info.op_id;

        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        
        const newDeck = shuffleArray(deck);
        socket.emit('shuffle_deck', { deck: newDeck, player_org: socket.id });
        op_socket.emit('shuffle_deck', { deck: newDeck, player_org: socket.id });
    });
}

module.exports = deckManager;
