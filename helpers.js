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

function buidDeck(deckString) {
    const deck = deckString.substring(1, deckString.length - 1).split(',');
    
    return shuffleArray(deck);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

module.exports = {createCode, buidDeck};
