const { createCode, buidDeck, createCoresObject, generateRandomTurn, Core } = require('../helpers');
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
                const myCores = createCoresObject();
                const opCores = createCoresObject();
                const active = generateRandomTurn();

                op_socket.leave('hosting');
                socket.leave('hosting');
                op_socket.join('dueling')
                socket.join('dueling');

                op_socket.emit('duel_start', {
                    op_id: socket.id, 
                    deck: opDeck, 
                    op_deck: myDeck,
                    cores: opCores,
                    op_cores: myCores,
                    active: active==1?true:false
                });
                socket.emit('duel_start', {
                    op_id: op_socket.id, 
                    deck: myDeck, 
                    op_deck: opDeck,
                    cores: myCores,
                    op_cores: opCores,
                    active: active==1?false:true
                });
            });

            socket.on('draw_card', ({ op_id, num }) => {
                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('draw_card', { player_org: socket.id, num });
            });

            socket.on('move_card', info => {
                const op_id = info.op_id;

                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('move_card', info);
            });

            socket.on('return_to_deck', info => {
                const op_id = info.op_id;

                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('return_to_deck', info);
            });

            socket.on('rest_unrest', info => {
                const { card_id, place, op_id } = info;

                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('rest_unrest', { card_id, place });
            });

            socket.on('looking_something', info => {
                const op_id = info.op_id;

                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('looking_something', info);
            });

            socket.on('flip_burst_card', info => {
                const op_id = info.op_id;
                
                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('flip_burst_card', info);
            });

            socket.on('move_cores', info => {
                const op_id = info.op_id;

                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }
                op_socket.emit('move_cores', info);
            });

            socket.on('increment_cores', info => {
                const op_id = info.op_id;
                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }

                const core = new Core(createCode(5));
                socket.emit('increment_cores', {...info, core});
                op_socket.emit('increment_cores', {...info, core});
            });

            socket.on('change_phase', ({name, op_id}) => {
                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }

                op_socket.emit('change_phase', { name });
            });

            socket.on('change_turn', ({ op_id }) => {
                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }

                op_socket.emit('change_turn');
            });

            socket.on('refresh_all', ({ player_org, op_id }) => {
                const op_socket = this.findSocket(op_id);
                if (!op_socket) { return; }

                op_socket.emit('refresh_all', { player_org });
                socket.emit('refresh_all', { player_org });
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
