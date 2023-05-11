const { createCode } = require('../helpers');
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
                socket.username = username;
                socket.join('hosting');
            });

            socket.on('start_duel', (info) => {
                const op_username = info.username;

                const ids = this.io.sockets.adapter.rooms.get('hosting');
                const ids_array = ids?Array.from(ids):[];
                console.log(ids_array);
                const oponent_idx = ids_array.findIndex(id => this.io.sockets.sockets.get(id).username == op_username);

                if (oponent_idx == -1) {
                    socket.emit('socket_message', {msg: "Oponent not found..."});
                    return;
                }

                const op_socket = this.io.sockets.sockets.get(ids_array[oponent_idx]);
                op_socket.leave('hosting');
                socket.leave('hosting');
                op_socket.join('dueling')
                socket.join('dueling');

                op_socket.emit('duel_start', {op_id: socket.id});
                socket.emit('duel_start', {op_id: op_socket.id});
            });

            socket.on('summon_card', ({ place, card_class, op_id }) => {
                const op_socket = this.findSocket(op_id);
                op_socket.emit('summon_card', { place, card_class });
            });

            socket.on('rest_unrest', ({card_id, place, op_id}) => {
                console.log(op_id);
                const op_socket = this.findSocket(op_id);
                op_socket.emit('rest_unrest', {card_id, place});
            });
        });
    }

    findSocket(id) {
        return this.io.sockets.sockets.get(id);
    }

    getRooms() {
        const ids = this.io.sockets.adapter.rooms.get('hosting');
        const ids_array = ids?Array.from(ids):[];
        const users = ids_array.map(id => this.io.sockets.sockets.get(id).username);
        return users;
    }
}

module.exports = websocketBuilder;
