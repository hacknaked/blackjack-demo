import { createId } from '@paralleldrive/cuid2'

/**
 * Game base class.
 * It handles the game expiration time and other basic properties
 * and functions about games in our server.
 */
export default class Game {
  DEFAULT_DELAY = 120
  DEFAULT_PLAYERNAME = 'Player1'

  constructor({ playerName, delay } = {}) {
    this.id = createId()
    this.playerName = playerName || this.DEFAULT_PLAYERNAME
    this.expiresAt = this._getExpirationTime(parseInt(delay) || this.DEFAULT_DELAY)
    this.startedAt = new Date()
    this.gameFinished = false
  }

  resolveAction({ action }) {
    if (this.gameFinished) {
      throw new Error('Game finished')
    }
    console.log(`${new Date().toISOString()} | ${this.id} | ${action}`)
  }

  getState() {
    return {
      id: this.id,
      playerName: this.playerName,
      startedAt: this.startedAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      finished: this.gameFinished,
    }
  }

  checkState(now = new Date()) {
    if (!this.gameFinished && now > this.expiresAt) {
      this.finalize()
    }
  }

  finalize() {
    this.gameFinished = true
  }

  _getExpirationTime(delay) {
    const now = new Date()
    return new Date(now.getTime() + delay * 1000)
  }
}
