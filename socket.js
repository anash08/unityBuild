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
    origin: ['https://unitysocketbuild.onrender.com', 'http://192.168.1.15:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.static(path.resolve(__dirname, 'clientSocket', 'build')));
app.use(cors());


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

    socket.on('convertedValue', (convertedValue) => {
        socket.broadcast.emit('convertedValue', convertedValue);
        console.log('convertedValue.........//', convertedValue);
        sendWebhook(convertedValue);

        const configuration = new Configuration({
            apiKey: "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",
        });

        const openai = new OpenAIApi(configuration);

        const response = openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${convertedValue}, "explain this piece of problem and show the entire solving problem process and show me the steps solved it line by line  its usage with a real-world example and explain like I am 4."`,
            max_tokens: 3000,
            temperature: 0.7,
        });

        response.then((result) => {
            console.log(result.data.choices[0].text.split(',  '));
            const responseData = { value: result.data.choices[0].text };
            res.json(responseData);
            console.log("Response data:for the query: ............//", responseData);
            sendWebhook(responseData);
        }).catch((error) => {
            console.log(error);
        });
    });

    socket.on('clearScreen', () => {
        socket.broadcast.emit('clearScreen');
    });



    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Function to send the converted value as a webhook to a specific URL
function sendWebhook(convertedValue, responseData) {
    // Make an HTTP request to the webhook URL
    // Replace 'https://example.com/webhook' with your webhook URL
    const webhookURL = 'https://webhookforunity.onrender.com/webhook';
    axios.post(webhookURL, { convertedValue }, { responseData })
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
})
