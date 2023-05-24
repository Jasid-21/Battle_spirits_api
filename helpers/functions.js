const { Card, Core } = require('./classes');

function createCode(num) {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = lower.toUpperCase();
    const numbers = '0123456789';
    const total = lower + upper + numbers;

    var code = '';
    for (var i = 0; i < num; i++) {
        code += total[Math.floor(Math.random()*(total.length))];
    }

    return code;
}

function createCoresObject() {
    return {
        in_life: Array.from({length: 5}, () => new Core(createCode(5))),
        in_reserve: [
            ...Array.from({length: 3}, () => new Core(createCode(5))), 
            new Core(createCode(5), true)
        ],
        in_trash: [],
        in_void: []
    }
}
function buidDeck(deckString) {
    const deckCodes = deckString.substring(1, deckString.length - 1).split(',');
    const deck = deckCodes.map(code => new Card(createCode(11), code));
    
    return shuffleArray(deck);
}

function shuffleArray(array) {
    createCoresObject();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

function generateRandomTurn() {
    return Math.round(Math.random());
}

function findSocket(io, id) {
    return io.sockets.sockets.get(id);
}

function getRooms(io) {
    const ids = io.sockets.adapter.rooms.get('hosting');
    const ids_array = ids?Array.from(ids):[];
    const users = ids_array.map(id => io.sockets.sockets.get(id).username);
    return users;
}

module.exports = { createCode, createCoresObject, 
    buidDeck, shuffleArray, generateRandomTurn, findSocket, getRooms };
