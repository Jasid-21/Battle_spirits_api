const express = require('express');
const router = express.Router();
const path = require('path');

router.get('*', function(req, resp) {
    resp.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
});

module.exports = router;
