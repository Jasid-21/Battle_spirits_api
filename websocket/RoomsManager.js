const { buidDeck, createCoresObject, generateRandomTurn, createCode, findSocket } = require('../helpers/functions');

function roomsManager (io, socket) {
    socket.on('host_room', (info) => {
        const ids = io.sockets.adapter.rooms.get('hosting');
        const ids_array = ids?Array.from(ids):[];
        const exist = ids_array.some(id => id == socket.id);
        
        if (exist) {
            socket.emit('socket_message', { msg: "You are alredy hosting a room..." });
            return;
        }

        const username = info.username + '_' + createCode(5);
        const deckString = info.deck;

        socket.username = username;
        socket.deckString = deckString;
        socket.join('hosting');
        socket.emit('hosting_room', { username });
    });

    socket.on('cancel_hosting', () => {
        socket.leave('hosting');
        socket.username = '';
        socket.deckString = '';
    });

    socket.on('request_duel', info => {
        const { board_id, username, deckString } = info;

        socket.username = username + '_' + createCode(5);
        socket.deckString = deckString;

        const op_socket = findSocket(io, board_id);
        if (!op_socket) { return; }
        if (!op_socket.rooms.has('hosting')) {
            socket.emit('socket_message', { msg: "This user is no longer hosting..." });
            return;
        }
        
        op_socket.emit('request_duel', { username: socket.username, user_id: socket.id });
    });

    socket.on('accept_duel', info => {
        const { op_id } = info;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        if (op_socket.rooms.has('dueling')) {
            socket.emit('socket_message', { msg: "This user alredy on a duel..." });
            return;
        }

        op_socket.emit('accept_duel', { op_id: socket.id });
    });

    socket.on('leave_room', info => {
        socket.leave('dueling');

        const { op_id } = info;
        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }
        if (op_socket.rooms.has('dueling')) {
            const params = { msg: 'Your oponent has left the room...', player_org: socket.id };
            op_socket.emit('new_message', params);
        }
    });

    socket.on('start_duel', (info) => {
        const { op_id } = info;
        const deckString = socket.deckString;
        const username = socket.username;

        const op_socket = findSocket(io, op_id);
        if (!op_socket) { return; }

        const myDeck = buidDeck(deckString);
        const opDeck = buidDeck(op_socket.deckString);
        const myCores = createCoresObject();
        const opCores = createCoresObject();
        const active = generateRandomTurn()==1;
        const players = [
            {
                username,
                id: socket.id
            },
            {
                username: op_socket.username,
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
