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
    origin: ['https://unitysocketbuild.onrender.com', 'http://192.168.1.15:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.static(path.resolve(__dirname, 'clientSocket', 'build')));

// Initialize session middleware
// app.use(
//     session({
//         secret: '1234',
//         resave: false,
//         saveUninitialized: true
//     })
// );// Generate a unique two-digit code for authentication
// const generateCode = () => {
//     const min = 10; // Minimum two-digit number
//     const max = 99; // Maximum two-digit number
//     return Math.floor(Math.random() * (max - min + 1)) + min;   


// };

io.on('connection', (socket) => {
    console.log('A user connected');

    // // Generate and send the authentication code
    // const authenticationCode = generateCode();
    // socket.emit('authenticationCode', authenticationCode);

    // socket.on('authenticate', (enteredCode) => {
    //     // Check if the entered code matches the authentication code
    //     if (enteredCode === authenticationCode.toString()) {
    //         // Store user session data
    //         socket.handshake.session.authenticated = true;
    //         socket.handshake.session.save();
    //         socket.emit('authenticated');
    //     } else {
    //         socket.emit('invalidCode');
    //     }
    // });

    // socket.on('drawing', (dataURL) => {
    //     // Broadcast drawing data to all authenticated users
    //     if (socket.handshake.session.authenticated) {
    //         socket.broadcast.emit('drawing', dataURL);
    //     }
    // });

    socket.on('convertedValue', (convertedValue) => {
        // Broadcast converted value to all authenticated users
        if (socket.handshake.session.authenticated) {
            socket.broadcast.emit('convertedValue', convertedValue);

            // Send the converted value as a webhook to a specific URL
            sendWebhook(convertedValue);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Function to send the converted value as a webhook to a specific URL
function sendWebhook(convertedValue) {
    // Make an HTTP request to the webhook URL
    // Replace 'https://example.com/webhook' with your webhook URL
    const webhookURL = 'https://webhookforunity.onrender.com/webhook';
    axios.post(webhookURL, { convertedValue })
        .then(response => {
            console.log('Webhook sent successfully');
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
