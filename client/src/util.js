//This shit will be our template to actually executing shit in the backend
function shuffle(a) {
    var j, x, i
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        x = a[i]
        a[i] = a[j]
        a[j] = x
    }
}

function getNewDeck() {
    let deck = [...Array(81)].map((x, i) => i)
    shuffle(deck)
    return deck
}

const cardsInitialState = {
    deck: [],
    board: [],
    collected: [],
    selected: {},
}

function startNewGame(initialState = cardsInitialState) {
    let newDeck = getNewDeck()
    let board = newDeck.splice(0, 12)
    return Object.assign({}, initialState, {
        deck: [...newDeck],
        board,
    })
}

function deal(state) {
    //leaving it blank for now
}

module.exports = {
    cardsInitialState,
    startNewGame,
    deal,
}
