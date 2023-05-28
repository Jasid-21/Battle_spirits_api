const { getRooms } = require('../helpers/functions');

const roomsManager = require('./RoomsManager');
const movementManager = require('./CardMovement');
const cardStateManager = require('./CardStates');
const coresManager = require('./CoresManager');
const deckManager = require('./DeckManager');
const playerManager = require('./PlayerManager');

const { Server } = require('socket.io');

class websocketBuilder {
    constructor (http) {
        this.io = new Server(http, {
            cors: {origin: '*'}
        });

        this.io.on('connection', socket => {
            console.log("New user connected...");

            roomsManager(this.io, socket);
            movementManager(this.io, socket);
            cardStateManager(this.io, socket);
            coresManager(this.io, socket);
            deckManager(this.io, socket);
            playerManager(this.io, socket);
        });
    }

    getRooms() {
        return getRooms(this.io);
    }
}

module.exports = websocketBuilder;
