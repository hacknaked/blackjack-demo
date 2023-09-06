import BlackjackGame from '../games/blackjackGame'

/**
 * This class implements a game server.
 * Every game has a expiration time property and this service
 * will terminate the game in case of timeout.
 */
class GameService {
  constructor() {
    this.games = []
    this.intervalId = setInterval(() => {
      this.checkTimers()
    }, 1000)
  }

  create(options) {
    const game = new BlackjackGame(options)
    // Add new games at front.
    this.games.unshift(game)
    return game.getState()
  }

  update(id, data) {
    const game = this._findGame(id)
    game.resolveAction(data)
  }

  delete(id) {
    const game = this._findGame(id)
    game.finish()
    this.games = this.games.filter((game) => game.id !== id)
  }

  getById(id) {
    const game = this._findGame(id)
    return game.getState()
  }

  getAll({ limit = Infinity } = {}) {
    const games = this.games.map((game) => game.getState())
    return games.slice(0, limit)
  }

  checkTimers() {
    const now = new Date()
    for (let game of this.games) {
      game.checkState(now)
    }
  }

  _findGame(id) {
    const game = this.games.find((game) => game.id === id)
    if (!game) {
      throw new Error('Game not found.')
    }
    return game
  }
}

export default new GameService()
