const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const cardSymbols = ['hearts', 'diamonds', 'clubs', 'spades']

/**
 * Factory function to create deck objects.
 *
 * @function
 * @param {object} options - Options for creating the deck.
 * @param {array} options.cards - The array of cards to create the deck.
 * @returns {object} Returns a new deck object.
 * @throws {Error} Throws an error if the options are invalid.
 */
const createDeck = ({ cards }) => {
  function shuffle() {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
  }

  function drawCard() {
    if (!cards.length) {
      throw new Error('Empty deck')
    }
    return cards.pop()
  }

  function size() {
    return cards.length
  }

  return {
    drawCard,
    shuffle,
    size,
  }
}

/**
 * Factory function to create Blackjack deck objects.
 *
 * @function
 * @returns {object} returns a shuffled Blackjack deck.
 */
const createBlackjackDeck = () => {
  let cards = []
  const deckSize = 6

  for (let i = 0; i < deckSize; i++) {
    for (const symbol of cardSymbols) {
      cards = cards.concat(
        cardValues.map((value) =>
          Object.freeze({
            value,
            symbol,
          })
        )
      )
    }
  }
  const deck = Object.create(createDeck({ cards }))
  deck.shuffle()
  return deck
}

export default { createDeck, createBlackjackDeck }
