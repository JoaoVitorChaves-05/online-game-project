import express from 'express'
import http from 'http'
import createGame from './public/create-game.js'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)
const PORT = process.env.PORT || 3000

app.use(express.static('public'))
const game = createGame()
game.start()

game.subscribe((command) => {
    console.log(`Emitting ${command.type}`)
    sockets.emit(command.type, command)
})

//game.addPlayer({playerId: 'player1', playerX: 1, playerY: 0})
//game.addPlayer({playerId: 'player2', playerX: 1, playerY: 0})
game.addFruit({fruitId: 'fruit1', fruitX: 4, fruitY: 7})
game.addFruit({fruitId: 'fruit2', fruitX: 1, fruitY: 3})

sockets.on('connection', (socket) => {
    const playerId = socket.id
    console.log(`> Player connected on server with id: ${playerId}`)

    game.addPlayer({playerId: playerId})

    socket.emit("setup", game.state)

    socket.on('disconnect', () => {
        game.removePlayer({ playerId: playerId})
        console.log(`> Player disconnected: ${playerId}`)
    })

    socket.on('move-player', (command) => {
        command.playerId = playerId
        command.type = 'move-player'

        game.movePlayer(command)
    })
})

server.listen(3000, () => {
    console.log(`> Server listening on port: 3000`)
})