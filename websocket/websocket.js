const { createCode, buidDeck } = require('../helpers');
const { Server } = require('socket.io');

class websocketBuilder {
    constructor (http) {
        this.io = new Server(http, {
            cors: {origin: '*'}, 
            pingInterval: 1000*60*5, 
            pingTimeout: 10000
        });

        this.io.on('connection', socket => {
            console.log("New user connected...");

            socket.on('host_room', (info) => {
                const ids = this.io.sockets.adapter.rooms.get('hosting');
                const ids_array = ids?Array.from(ids):[];
                const exist = ids_array.some(id => id == socket.id);
                
                if (exist) {
                    socket.emit('socket_message', {msg: "You are alredy hosting a room..."});
                    return;
                }

                const username = info.username + '_' + createCode(5);
                const deckString = info.deck;

                socket.board_name = username;
                socket.deck = deckString;
                socket.join('hosting');
            });

            socket.on('start_duel', (info) => {
                const { board_name, deckString } = info;

                const ids = this.io.sockets.adapter.rooms.get('hosting');
                const ids_array = ids?Array.from(ids):[];
                console.log(ids_array);
                const oponent_idx = ids_array.findIndex(id => this.io.sockets.sockets.get(id).board_name == board_name);

                if (oponent_idx == -1) {
                    socket.emit('socket_message', {msg: "Oponent not found..."});
                    return;
                }

                const op_socket = this.findSocket(ids_array[oponent_idx]);
                const myDeck = buidDeck(deckString);
                const opDeck = buidDeck(op_socket.deck);

                op_socket.leave('hosting');
                socket.leave('hosting');
                op_socket.join('dueling')
                socket.join('dueling');

                op_socket.emit('duel_start', {op_id: socket.id, deck: opDeck});
                socket.emit('duel_start', {op_id: op_socket.id, deck: myDeck});
            });

            socket.on('draw_card', ({op_id, card}) => {
                const op_socket = this.findSocket(op_id);
                console.log(card);
                card.seted = true;
                op_socket.emit('draw_card', {card, op_id: socket.id});
            });

            socket.on('move_card', info => {
                const op_id = info.op_id;
                const op_socket = this.findSocket(op_id);
                op_socket.emit('move_card', info);
            });

            socket.on('return_to_deck', info => {
                const op_id = info.op_id;
                const op_socket = this.findSocket(op_id);
                op_socket.emit('return_to_deck', info);
            });

            socket.on('rest_unrest', info => {
                const { card_id, place, op_id } = info;
                const op_socket = this.findSocket(op_id);
                op_socket.emit('rest_unrest', { card_id, place });
            });
        });
    }

    findSocket(id) {
        return this.io.sockets.sockets.get(id);
    }

    getRooms() {
        const ids = this.io.sockets.adapter.rooms.get('hosting');
        const ids_array = ids?Array.from(ids):[];
        const users = ids_array.map(id => this.io.sockets.sockets.get(id).board_name);
        return users;
    }
}

module.exports = websocketBuilder;
