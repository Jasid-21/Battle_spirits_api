class Card {
    constructor(id, code) {
        this.id = id;
        this.code = code;
        this.url = `https://battlespirits-saga.com/images/cards/card/${code}.png`;
        this.seted = false;
        this.rested = false;
        this.cores = []
    }
}

class Core {
    constructor(id, soul = false) {
        this.id = id;
        this.soul = soul;
        this.selected = false;
    }
}

module.exports = { Card, Core };