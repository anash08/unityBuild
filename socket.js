const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 9000;

app.use(cors({
    origin: ['https://unitysocketbuild.onrender.com', 'http://192.168.1.104:3000', "http://localhost:5000"],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
const generateCode = () => {
    const min = 10; // Minimum two-digit number
    const max = 99; // Maximum two-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sessionMiddleware = session({
    secret: "123",
    resave: false,
    saveUninitialized: true,
});

app.use(sessionMiddleware);

io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));



app.use(express.static(path.resolve(__dirname, 'clientSocket', 'build')));

// Generate a unique two-digit code for authentication

io.on('connection', (socket) => {
    console.log('A user connected');
    io.use((socket, next) => {
        socket.session = socket.handshake.session;
        next();
    });
    const generateCode = () => {
        const min = 10; // Minimum two-digit number
        const max = 99; // Maximum two-digit number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };


    // Generate and send the authentication code
    const authenticationCode = generateCode();
    socket.emit('authenticationCode', authenticationCode);

    socket.on('authenticate', (enteredCode) => {
        // Check if the entered code matches the authentication code
        if (enteredCode === authenticationCode.toString()) {
            socket.emit('authenticated');
            console.log('entered code by client auth...........//', authenticationCode);
            socket.handshake.session.authenticated = true; // Store authentication status in session
            socket.handshake.session.save(); // Save the session
            console.log('entered code by client', enteredCode);
        } else {
            socket.emit('invalidCode');
        }
    });

    socket.on('drawing', (dataURL) => {
        socket.broadcast.emit('drawing', dataURL);
    });

    function convertToLatex(input) {
        // Replace backslashes with double backslashes
        let latex = input.replace(/\\/g, '\\\\');

        // Add curly braces around superscripts
        latex = latex.replace(/\^(\w+)/g, '^{$1}');

        // Add necessary spacing around mathematical operators
        latex = latex.replace(/([+\-*\/=])/g, ' $1 ');

        // Add backticks around single characters to prevent conflicts with LaTeX commands
        // latex = latex.replace(/([A-Za-z])/g, '`$1`');

        return latex;
    }

    socket.on('convertedValue', (convertedValue) => {
        convertedValue = convertToLatex(convertedValue);
        console.log('convertedValue.........//', convertedValue);
        socket.broadcast.emit('convertedValue', convertedValue);
        sendWebhook(convertedValue);
    });

    socket.on('generations', (generations) => {
        socket.emit('newGeneration', generations);
    });

    socket.on('clearScreen', () => {
        socket.broadcast.emit('clearScreen');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Function to send the converted value as a webhook to a specific URL
function sendWebhook(convertedValue) {
    // const webhookURL = 'https://webhookforunity.onrender.com/webhook';
    const webhookURL = 'https://webhookforunity.onrender.com/webhook';
    axios.post(webhookURL, { convertedValue })
        .then(response => {
            const generations = response.data
            console.log('Webhook sent successfully', generations);

        })
        .catch(error => {
            console.error('Error sending webhook:', error);
        });
}

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
