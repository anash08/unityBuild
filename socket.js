const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: ['https://unitysocketbuild.onrender.com', 'http://192.168.1.15:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.static(path.resolve(__dirname, 'clientSocket', 'build')));

// Generate a unique two-digit code for authentication
const generateCode = () => {
    const min = 1; // Minimum two-digit number
    const max = 2; // Maximum two-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Generate and send the authentication code
    const authenticationCode = generateCode();
    socket.emit('authenticationCode', authenticationCode);

    socket.on('authenticate', (enteredCode) => {
        // Check if the entered code matches the authentication code
        if (enteredCode === authenticationCode.toString()) {
            socket.emit('authenticated');
        } else {
            socket.emit('invalidCode');
        }
    });

    socket.on('drawing', (dataURL) => {
        socket.broadcast.emit('drawing', dataURL);
    });

    socket.on('convertedValue', (convertedValue) => {
        socket.broadcast.emit('convertedValue', convertedValue);
        console.log("convertedValue.........//", convertedValue);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.get("/", (req, res) => {
    console.log("Get request to Homepage");
    res.send("Hi, sent by server...");
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'clientSocket', 'build', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server initialized. Listening on PORT ${PORT}`);
});
