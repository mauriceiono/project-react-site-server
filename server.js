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
app.use(express.static(__dirname)); // Serve static assets 

// Character data array
const characters = [
    {
        id: "mario",
        name: "Mario",
        game: "Super Mario",
        description: "A plumber who goes on adventures to rescue Princess Peach.",
        abilities: "Superhuman agility, jumping, and power-ups like Fire Flower.",
        trivia: "His first appearance was in the 1981 arcade game Donkey Kong.",
        image: "images/mario.jpg"
    },
    {
        id: "sonic",
        name: "Sonic the Hedgehog",
        game: "Sonic the Hedgehog",
        description: "A speedy blue hedgehog on a quest to stop Dr. Robotnik.",
        abilities: "Super speed, agility, and spin attacks.",
        trivia: "Sonic’s original design was based on a mix of a hedgehog and an armadillo.",
        image: "images/sonic.jpg"
    },
    {
        id: "link",
        name: "Link",
        game: "The Legend of Zelda",
        description: "A hero tasked with rescuing Princess Zelda and defeating Ganon.",
        abilities: "Mastery of various weapons, puzzle-solving, and magic.",
        trivia: "Link is often mistaken for Zelda, but he is the hero of the series.",
        image: "images/link.jpg"
    },
    {
        id: "bowser",
        name: "Bowser",
        game: "Super Mario",
        description: "The king of the Koopas and a constant threat to Mario.",
        abilities: "Fire breathing, immense strength, and magical powers.",
        trivia: "Bowser has been the main antagonist in the Mario series since 1985.",
        image: "images/bowser.jpg"
    },
    {
        id: "eggman",
        name: "Dr. Eggman",
        game: "Sonic the Hedgehog",
        description: "A genius inventor and the main antagonist in the Sonic series.",
        abilities: "Mastery of robotics and engineering, along with intelligence.",
        trivia: "Eggman’s real name is Dr. Ivo Robotnik.",
        image: "images/eggman.jpg"
    },
    {
        id: "ganondorf",
        name: "Ganondorf",
        game: "The Legend of Zelda",
        description: "The primary antagonist of the series, seeking power through the Triforce.",
        abilities: "Dark magic and combat skills.",
        trivia: "Ganondorf is the Gerudo king and the human form of Ganon.",
        image: "images/ganondorf.jpg"
    },
    {
        id: "luigi",
        name: "Luigi",
        game: "Super Mario",
        description: "Mario's younger brother, known for his green outfit.",
        abilities: "Similar to Mario but with a unique jump and abilities.",
        trivia: "Luigi first appeared in 1983 in the arcade game Mario Bros.",
        image: "images/luigi.jpg"
    },
    {
        id: "tails",
        name: "Tails",
        game: "Sonic the Hedgehog",
        description: "Sonic’s sidekick with twin tails that allow him to fly.",
        abilities: "Flight and mechanical skills.",
        trivia: "Tails was first introduced in Sonic the Hedgehog 2 in 1992.",
        image: "images/tails.jpg"
    },
    {
        id: "fi",
        name: "Fi",
        game: "The Legend of Zelda: Skyward Sword",
        description: "The spirit of the Master Sword, aiding Link in his journey.",
        abilities: "Can analyze enemies and give Link information.",
        trivia: "Fi has a calm and emotionless demeanor, unlike many characters.",
        image: "images/fi zelda.jpg"
    }
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
