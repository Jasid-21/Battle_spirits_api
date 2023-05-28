const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + '/dist'));
app.use(cors({origin: '*'}));

const http = app.listen(PORT, () => {
    console.log("Server listening in port: ", PORT);
});

const websocketBuilder = require('./websocket/websocket');
const io = new websocketBuilder(http);

const Rooms = require('./http/Controllers/Rooms.js')(io);
const Home = require('./http/Controllers/Home');
//const Test = require('./http/Controllers/Test');
app.use('/rooms', Rooms);
app.use('/', Home);
