import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware setup
app.use(cors());
app.use(bodyParser.json());  // Parse JSON data from the frontend
app.use(express.static('public')); // Serve static assets (like images)

// Character data array
const characters = [
    { id: "mario", name: "Mario", game: "Super Mario", description: "A plumber...", abilities: "Superhuman agility...", trivia: "His first appearance was in Donkey Kong...", image: "images/mario.jpg" },
    { id: "sonic", name: "Sonic", game: "Sonic the Hedgehog", description: "A speedy blue hedgehog...", abilities: "Super speed, agility...", trivia: "Sonic's original design...", image: "images/sonic.jpg" },
    { id: "link", name: "Link", game: "The Legend of Zelda", description: "A hero tasked with rescuing Princess Zelda...", abilities: "Mastery of various weapons...", trivia: "Link is often mistaken for Zelda...", image: "images/link.jpg" },
    // Add other characters similarly
];

// Endpoint to get all characters
app.get('/api/characters', (req, res) => {
    res.json(characters);
});

// Endpoint to get a character by ID
app.get('/api/characters/:id', (req, res) => {
    const character = characters.find(char => char.id === req.params.id);
    if (character) {
        res.json(character);
    } else {
        res.status(404).json({ message: 'Character not found' });
    }
});

// POST route to handle form submissions
app.post('/send', async (req, res) => {
    const { name, email, message } = req.body;
    const json = JSON.stringify({
        name,
        email,
        message,
        access_key: '1a115c8c-ffcc-41cf-973b-be26c8c56204'  // Web3Forms API key
    });

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: json,
        });

        if (response.ok) {
            res.json({ status: 'success', message: 'Email sent successfully!' });
        } else {
            res.json({ status: 'error', message: 'Email could not be sent.' });
        }
    } catch (error) {
        res.json({ status: 'error', message: 'Error sending email.' });
    }
});

// Serve the index.html for documentation or testing
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
