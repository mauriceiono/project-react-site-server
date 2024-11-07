const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON data
app.use(express.json());

// Sample array of data (replace with JSON data structure)
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
    // Add more characters here
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

// Display index.html with API documentation
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
