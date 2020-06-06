const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// app.use(express.json())
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New websocket connection')


    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('welcome', "Admin"))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`, "Admin"))
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        callback()
    })

    socket.on('send_message', (message, callback) => {
        const user = getUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage(message, user.username))
            callback()
        }
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the room`, "Admin"))
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        }

    })
    socket.on('SendLocation', (postion, callback) => {
        const user = getUser(socket.id)
        if (user) {
            io.to(user.room).emit('locationMessage', { message: `https://google.com/maps?q=${postion.lat},${postion.long}`, usernameFromServer: user.username })
            callback()
        }
    })
})

server.listen(port, () =>
    console.log('server is up on port ' + port))
