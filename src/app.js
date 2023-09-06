import express from 'express'
import process from 'process'
import path from 'path'
import bodyParser from 'body-parser'
import gameRoutes from './routes/gameRoutes'

const port = 3000
const publicPath = path.join(process.cwd(), 'public')
const indexPath = path.join(publicPath, 'index.html')
const playPath = path.join(publicPath, 'play.html')

const app = express()
app.use(express.static(publicPath))
app.use(bodyParser.json())
app.use('/api/games', gameRoutes)

app.get('/', (req, res) => {
  res.sendFile(indexPath)
})

app.get('/games/:id', (req, res) => {
  res.sendFile(playPath)
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
