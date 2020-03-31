const path = require('path');
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express();
const server = http.createServer(app) 
const io = socketio(server)

const port = process.env.PORT;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

io.on('connection', (socket) => {
    console.log('new WebSocket connection')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'Anew user has joined!')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.emit('message', message)
        callback('Delivered!')
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left :(')
    })

    socket.on('sendLocation', (coords, callback) =>  {
        io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up and running on port ' + port)
});