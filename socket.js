const { Configuration, OpenAIApi } = require("openai");

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: ['https://unitysocketbuild.onrender.com', 'http://192.168.1.104:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.static(path.resolve(__dirname, 'clientSocket', 'build')));

// Generate a unique two-digit code for authentication
const generateCode = () => {
    const min = 10; // Minimum two-digit number
    const max = 99; // Maximum two-digit number
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
        sendWebhook(convertedValue)
    });

    socket.on('generations', (generations) => {
        socket.emit('generations', generations);
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
    // Replace 'https://example.com/webhook' with your webhook URL
    const webhookURL = 'http://localhost:5000/webhook';
    axios.post(webhookURL, { convertedValue })
        .then(response => {
            console.log('Webhook sent successfully', response.data);
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