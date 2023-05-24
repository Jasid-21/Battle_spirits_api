const { buidDeck, createCoresObject, generateRandomTurn, createCode, findSocket } = require('../helpers/functions');

function roomsManager (io, socket) {
    socket.on('host_room', (info) => {
        const ids = io.sockets.adapter.rooms.get('hosting');
        const ids_array = ids?Array.from(ids):[];
        const exist = ids_array.some(id => id == socket.id);
        
        if (exist) {
            socket.emit('socket_message', {msg: "You are alredy hosting a room..."});
            return;
        }

        const username = info.username + '_' + createCode(5);
        const deckString = info.deck;

        socket.username = username;
        socket.deck = deckString;
        socket.join('hosting');
    });

    socket.on('start_duel', (info) => {
        const { board_name, deckString, username } = info;
        socket.username = username;

        const ids = io.sockets.adapter.rooms.get('hosting');
        const ids_array = ids?Array.from(ids):[];
        console.log(ids_array);
        const oponent_idx = ids_array.findIndex(id => io.sockets.sockets.get(id).username == board_name);

        if (oponent_idx == -1) {
            socket.emit('socket_message', {msg: "Oponent not found..."});
            return;
        }

        const op_socket = findSocket(io, ids_array[oponent_idx]);
        const myDeck = buidDeck(deckString);
        const opDeck = buidDeck(op_socket.deck);
        const myCores = createCoresObject();
        const opCores = createCoresObject();
        const active = generateRandomTurn()==1;
        const players = [
            {
                username,
                id: socket.id
            },
            {
                username: board_name,
                id: op_socket.id
            }
        ]

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
            active,
            players
        });
        socket.emit('duel_start', {
            op_id: op_socket.id, 
            deck: myDeck, 
            op_deck: opDeck,
            cores: myCores,
            op_cores: opCores,
            active: !active,
            players
        });
    });
}

module.exports = roomsManager;
