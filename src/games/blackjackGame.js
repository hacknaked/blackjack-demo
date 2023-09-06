import deckService from '../services/deckService'
import Game from './game'

/**
 * Implements a simplified Blackjack game
 * on top of the Game base class.
 */
export default class BlackjackGame extends Game {
  HAND_LIMIT = 21
  DEALER_HAND_LIMIT = 17

  constructor(options) {
    super(options)
    this.deck = deckService.createBlackjackDeck()
    this.dealer = null
    this.player = null
    this._initRound()
  }

  /**
   * Returns the game state.
   * (players hands, flags, expiration time, etc.)
   */
  getState() {
    function _parseHand(player) {
      const { hand: handFaceUp, handFaceDown, ...props } = player
      const hand = handFaceDown
        .map(() => {
          return { value: '?', symbol: 'facedown' }
        })
        .concat(handFaceUp)
      return { hand, ...props }
    }
    return {
      id: this.id,
      playerName: this.playerName,
      expiresAt: this.expiresAt.toISOString(),
      finished: this.gameFinished,
      dealer: _parseHand(this.dealer),
      player: _parseHand(this.player),
      winner: this._getWinner(),
    }
  }

  /**
   * This function receives a user action with the command to play and
   * dispatchs the action to the proper action handler.
   *
   * @param {string} action - User action to play (hit | stay).
   * @throws Throws an exception if the action is unknown.
   */
  resolveAction({ action }) {
    super.resolveAction({ action })
    switch (action) {
      case 'hit':
        this.playerHits()
        break
      case 'stay':
        this.playerStays()
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  /**
   * <hit> action handler.
   */
  playerHits() {
    this._hit(this.player)
    if (this.player.bust) {
      this._showHand(this.dealer)
      this._stay(this.dealer)
      this.gameFinished = true
    }
  }

  /**
   * <stay> action handler.
   */
  playerStays() {
    this._showHand(this.dealer)
    while (this.dealer.handValue < this.DEALER_HAND_LIMIT) {
      this._hit(this.dealer)
    }
    if (!this.dealer.bust) {
      this._stay(this.dealer)
    }
    this.gameFinished = true
  }

  /**
   * This function finalizes the game in a gently manner.
   * Can be called by the game service if a timeout is detected.
   */
  finalize() {
    super.finalize()
    this._showHand(this.dealer)
  }

  /**
   * This function initializes the round:
   *
   * dealer hits (face down)
   * player hits (face up)
   * dealer hits (face up)
   * player hits (face up)
   */
  _initRound() {
    this.dealer = { hand: [], handFaceDown: [], handValue: 0, bust: false, end: false }
    this.player = { hand: [], handFaceDown: [], handValue: 0, bust: false, end: false }
    this._hitFaceDown(this.dealer)
    this._hit(this.player)
    this._hit(this.dealer)
    this._hit(this.player)
  }

  /**
   * Validates if the player is able to play more actions.
   */
  _checkStatus(player) {
    if (player.end) {
      throw new Error('No more actions available.')
    }
  }

  /**
   * his function implements a player hit action (face up).
   * @param {object} player - Object container with a player state.
   */
  _hit(player) {
    this._checkStatus(player)
    const card = this.deck.drawCard()
    player.hand.push(card)
    player.handValue = this._getHandValue(player)
    if (player.handValue > this.HAND_LIMIT) {
      player.bust = true
      player.end = true
    }
  }

  /**
   * This function implements a player hit action (face down).
   * @param {object} player - Object container with a player state.
   */
  _hitFaceDown(player) {
    this._checkStatus(player)
    const card = this.deck.drawCard()
    player.handFaceDown.push(card)
    // Face down cards do not change the hand value, so we are done.
  }

  /**
   * This function implements a player stay action.
   * @param {*} player - Object container with a player state.
   */
  _stay(player) {
    this._checkStatus(player)
    player.end = true
  }

  /**
   * This function simulates a player showing its face down cards.
   */
  _showHand(player) {
    player.hand = [...player.handFaceDown, ...player.hand]
    player.handFaceDown = []
    player.handValue = this._getHandValue(player)
  }

  /**
   * Decide who win the game
   * @returns {string|null} dealer | player
   */
  _getWinner() {
    if (this.player.bust) {
      return 'dealer'
    }
    if (this.player.handValue > this.dealer.handValue) {
      return 'player'
    }
    if (this.dealer.bust) {
      return 'player'
    }
    if (this.player.handValue < this.dealer.handValue) {
      return 'dealer'
    }
    return null // no winner (draw)
  }

  /**
   * Calculates the value of a Blackjack hand.
   * Only face up cards are counted.
   */
  _getHandValue(player) {
    let handValue = 0
    let aceCount = 0

    for (let card of player.hand) {
      if (card.value == 'A') {
        aceCount++
        handValue += 11
      } else if ('JQK'.includes(card.value)) {
        handValue += 10
      } else {
        handValue += parseInt(card.value)
      }
    }
    // Handle Aces.
    while (aceCount > 0 && handValue > this.HAND_LIMIT) {
      handValue -= 10
      aceCount--
    }
    return handValue
  }
}
