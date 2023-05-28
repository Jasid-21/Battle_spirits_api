const express = require('express');
const router = express.Router();
const cors = require('cors');

router.use(cors());

module.exports = (websocketServer) => {
    router.get('/getAll', function(req, resp) {
        resp.status(200).send({rooms: websocketServer.getRooms()});
    });

    return router;
}
