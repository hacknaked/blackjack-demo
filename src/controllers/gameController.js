import gameService from '../services/gameService'

class GameController {
  getAll(req, res) {
    try {
      const resources = gameService.getAll(req.query)
      res.json(resources)
    } catch (error) {
      res.status(400).json({ error })
    }
  }

  getById(req, res) {
    try {
      const resource = gameService.getById(req.params.id)
      res.json(resource)
    } catch (e) {
      res.status(404).json({ error: 'not found' })
    }
  }

  create(req, res) {
    try {
      const resource = gameService.create(req.body)
      res.status(201).json(resource)
    } catch (error) {
      res.status(400).json({ error })
    }
  }

  update(req, res) {
    try {
      gameService.update(req.params.id, req.body)
      res.status(204).json()
    } catch (error) {
      res.status(400).json({ error })
    }
  }

  delete(req, res) {
    try {
      gameService.delete(req.params.id)
      res.status(204).json()
    } catch (error) {
      res.status(400).json({ error })
    }
  }
}

export default new GameController()
