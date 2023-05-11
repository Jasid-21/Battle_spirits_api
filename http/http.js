const express = require('express');
const app = express();
const websocketBuilder = require('../websocket/websocket');

const PORT = process.env.PORT || 3000;


const http = app.listen(PORT, () => {
    console.log("Server listening in port: ", PORT);
});

const io = new websocketBuilder(http);

module.exports = http;
