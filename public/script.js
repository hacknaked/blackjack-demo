/* eslint-disable no-unused-vars */

const symbolMap = {
  hearts: '&#9829;',
  diamonds: '&#9830;',
  clubs: '&#9827;',
  spades: '&#9824;',
  facedown: '?',
}

function navigateTo(gameId) {
  window.location.href = '/games/' + gameId
}

function getGameId() {
  const url = window.location.href
  const pathname = new URL(url).pathname
  const parts = pathname.split('/').filter((p) => p)
  return parts[parts.length - 1]
}

function gameTime(game) {
  const now = new Date()
  const expiresAt = new Date(game.expiresAt)
  const diff = expiresAt - now
  return Math.floor((diff < 0 ? 0 : diff) / 1000)
}

function truncate(str) {
  if (str.length > 24) {
    return str.slice(0, 24) + '...'
  } else {
    return str
  }
}

async function fetchData({ url = '/api/games', method = 'GET', body = '' } = {}) {
  try {
    const response = await fetch(url, {
      method,
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
    })
    if (!response.ok) {
      console.error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}

async function renderLatestGames() {
  const games = await fetchData({ url: 'api/games?limit=25' })
  const tableBody = document.querySelector('#gameTable tbody')
  tableBody.innerHTML = ''
  for (const game of games) {
    const row = tableBody.insertRow()
    row.classList.add('row-hover', 'uk-text-truncate')
    row.insertCell().textContent = truncate(game.id)
    row.insertCell().textContent = truncate(game.playerName)
    row.insertCell().textContent = game.finished ? (game.winner ? game.winner : '<draw>') : '-'
    row.addEventListener('click', () => {
      navigateTo(game.id)
    })
  }
}

function renderPlayer(playerName, data) {
  const dealerElement = document.getElementById(playerName)
  // Create a parent container for the player.
  const container = document.createElement('div')
  container.className = 'uk-margin-medium-top'
  container.id = playerName
  const heading = document.createElement('h4')
  heading.textContent = `${playerName} (${data.handValue})`
  // Create a flex container for the cards.
  const cardContainer = document.createElement('div')
  cardContainer.className = 'uk-flex uk-margin-top'
  // Loop through each card in the hand and create card elements.
  data.hand.forEach((cardData) => {
    const card = document.createElement('div')
    const symbol = symbolMap[cardData.symbol]
    card.className = `uk-card uk-card-default uk-card-body uk-margin-right uk-border-rounded bjcard ${cardData.symbol}`
    card.innerHTML = `<span>${symbol}</span>${cardData.value}<span>${symbol}</span>`
    cardContainer.appendChild(card)
  })
  // Append elements to the container.
  container.appendChild(heading)
  container.appendChild(cardContainer)
  dealerElement.replaceWith(container)
}

async function renderGame() {
  const id = getGameId()
  const game = await fetchData({ url: `/api/games/${id}` })
  renderPlayer('dealer', game.dealer)
  renderPlayer('player', game.player)
  // Render status
  if (game.finished) {
    document.getElementById('status').innerHTML = 'finished'
    document.getElementById('winner').innerHTML = game.winner || 'none (draw)'
  } else {
    document.getElementById('status').innerHTML = `playing... ${gameTime(game)}`
    document.getElementById('winner').innerHTML = '-'
  }
  // Handle buttons state.
  const buttons = document.querySelectorAll('button')
  buttons.forEach((button) => {
    button.disabled = game.finished
  })
  return game.finished
}

async function newGame() {
  const game = await fetchData({
    method: 'POST',
    body: {
      playerName: document.querySelector('#playerName').value,
      delay: document.querySelector('#delay').value,
    },
  })
  navigateTo(game.id)
}

async function playAction(action) {
  const id = getGameId()
  await fetchData({ url: `/api/games/${id}`, method: 'PUT', body: { action } })
  await renderGame()
}

async function hydrateView(render, msec) {
  await render()
  const interval = setInterval(async () => {
    let finished = await render()
    if (finished) {
      clearInterval(interval)
    }
  }, msec)
}
