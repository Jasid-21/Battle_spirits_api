const express = require('express');
const app = express();


const PORT = process.env.PORT || 3000;
const http = app.listen(PORT, () => {
    console.log("Server listening in port: ", PORT);
});

const websocketBuilder = require('./websocket/websocket');
const io = new websocketBuilder(http);

const Rooms = require('./http/Controllers/Rooms.js')(io);
//const Test = require('./http/Controllers/Test');
app.use('/rooms', Rooms);
