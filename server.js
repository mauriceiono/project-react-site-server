import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Joi from "joi";
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library
import multer from 'multer'; // Import multer

const app = express();
const PORT = process.env.PORT || 3000;

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware setup
app.use(cors({ origin: 'https://project-react-site.onrender.com' })); // Allow requests from your frontend domain
app.use(bodyParser.json()); // Parse JSON data from the frontend
app.use(express.static(__dirname)); // Serve static assets 
app.use('/images', express.static(join(__dirname, 'images'))); // Serve images directory

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,'./images')); // Save images to the 'images' directory
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  const upload = multer({ storage: storage });
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://mockit:superman123@cluster0.k5qvx.mongodb.net/testdb?retryWrites=true&w=majority")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Define Character Schema
const characterSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }
});

// Create the Character model
const Character = mongoose.model('Character', characterSchema);

// Hardcoded characters data
const hardcodedCharacters = [
    {
        id: "mario",
        name: "Mario",
        description: "The beloved plumber who saves the Mushroom Kingdom.",
        image: "images/mario.jpg"
    },
    {
        id: "sonic",
        name: "Sonic the Hedgehog",
        description: "The fastest hedgehog who loves adventure.",
        image: "images/sonic.jpg"
    },
    {
        id: "link",
        name: "Link",
        description: "The courageous hero on a quest to save Princess Zelda.",
        image: "images/link.jpg"
    },
    {
        id: "bowser",
        name: "Bowser",
        description: "The main antagonist of the Mario series.",
        image: "images/bowser.jpg"
    },
    {
        id: "eggman",
        name: "Dr. Eggman",
        description: "Sonic’s arch-nemesis with a love for robotics.",
        image: "images/eggman.jpg"
    },
    {
        id: "ganondorf",
        name: "Ganondorf",
        description: "Link's arch nemesis.",
        image: "images/ganondorf.jpg"
    },
    {
        id: "luigi",
        name: "Luigi",
        description: "Mario’s younger brother and loyal companion.",
        image: "images/luigi.jpg"
    },
    {
        id: "tails",
        name: "Miles \"Tails\" Prower",
        description: "Sonic’s two-tailed fox friend and tech genius.",
        image: "images/tails.jpg"
    },
    {
        id: "fi",
        name: "Fi",
        description: "The spirit of the Master Sword which Link wields.",
        image: "images/fi zelda.jpg"
    }
];

// Function to insert hardcoded characters into MongoDB if they do not already exist
const insertHardcodedCharacters = async () => {
    try {
        for (const character of hardcodedCharacters) {
            const existingCharacter = await Character.findOne({ id: character.id });
            if (!existingCharacter) {
                const newCharacter = new Character(character);
                await newCharacter.save();
            }
        }
        console.log("Hardcoded characters inserted successfully.");
    } catch (err) {
        console.error("Error inserting hardcoded characters:", err);
    }
};

// Call the function to insert hardcoded characters
insertHardcodedCharacters();

// Endpoint to get characters from CharacterList collection in MongoDB
app.get('/api/CharacterList', async (req, res) => {
    try {
        const characters = await Character.find();
        if (characters.length === 0) {
            return res.status(404).json({ message: 'No characters found in the database' });
        }
        res.json(characters);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching characters from MongoDB', error: err.message });
    }
});

// Add New Character to CharacterList in MongoDB (POST)
app.post('/api/CharacterList', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? `images/${req.file.filename}` : req.body.image;

    // Validate incoming data
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required()
    });

    const { error } = schema.validate({ name, description, image });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Generate a unique ID
        const id = uuidv4();

        // Add the new character to MongoDB
        const newCharacter = new Character({ id, name, description, image });
        const savedCharacter = await newCharacter.save();

        res.status(201).json({ message: 'Character added successfully!', character: savedCharacter });
    } catch (err) {
        res.status(500).json({ message: 'Error adding character to MongoDB', error: err.message });
    }
});

// Endpoint to get a character by ID from CharacterList in MongoDB
app.get('/api/CharacterList/:id', async (req, res) => {
    try {
        const character = await Character.findOne({ id: req.params.id });
        if (character) {
            res.json(character);
        } else {
            res.status(404).json({ message: 'Character not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching character', error: err.message });
    }
});

app.put('/api/CharacterList/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const image = req.file ? `images/${req.file.filename}` : req.body.image;
  
    // Validate incoming data
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required()
    });
  
    const { error } = schema.validate({ name, description, image });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    try {
      const updatedCharacter = await Character.findOneAndUpdate(
        { id },
        { name, description, image },
        { new: true }
      );
  
      if (!updatedCharacter) {
        return res.status(404).json({ message: 'Character not found' });
      }
  
      res.status(200).json({ message: 'Character updated successfully!', character: updatedCharacter });
    } catch (err) {
      res.status(500).json({ message: 'Error updating character', error: err.message });
    }
  });

// Delete a character by ID from CharacterList (DELETE)
app.delete('/api/CharacterList/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCharacter = await Character.findOneAndDelete({ id });
        if (!deletedCharacter) {
            return res.status(404).json({ message: 'Character not found' });
        }

        res.status(200).json({ message: 'Character deleted successfully!', character: deletedCharacter });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting character', error: err.message });
    }
});

// Hardcoded Characters Endpoint
app.get('/api/characters', async (req, res) => {
    // Hardcoded character data
    const hardcodedCharacters = [
        {
            id: "mario",
            name: "Mario",
            game: "Super Mario",
            description: "A plumber who goes on adventures to rescue Princess Peach.",
            abilities: "Superhuman agility, jumping, and power-ups like Fire Flower.",
            trivia: "His first appearance was in the 1981 arcade game Donkey Kong.",
            image: "/images/mario.jpg"
        },
        {
            id: "sonic",
            name: "Sonic the Hedgehog",
            game: "Sonic the Hedgehog",
            description: "A speedy blue hedgehog on a quest to stop Dr. Robotnik.",
            abilities: "Super speed, agility, and spin attacks.",
            trivia: "Sonic’s original design was based on a mix of a hedgehog and an armadillo.",
            image: "/images/sonic.jpg"
        },
        {
            id: "link",
            name: "Link",
            game: "The Legend of Zelda",
            description: "A hero tasked with rescuing Princess Zelda and defeating Ganon.",
            abilities: "Mastery of various weapons, puzzle-solving, and magic.",
            trivia: "Link is often mistaken for Zelda, but he is the hero of the series.",
            image: "/images/link.jpg"
        },
        {
            id: "bowser",
            name: "Bowser",
            game: "Super Mario",
            description: "The king of the Koopas and a constant threat to Mario.",
            abilities: "Fire breathing, immense strength, and magical powers.",
            trivia: "Bowser has been the main antagonist in the Mario series since 1985.",
            image: "/images/bowser.jpg"
        },
        {
            "id": "eggman",
            "name": "Dr. Eggman",
            "game": "Sonic the Hedgehog",
            "description": "A genius inventor and the main antagonist in the Sonic series.",
            "abilities": "Mastery of robotics and engineering, along with intelligence.",
            "trivia": "Eggman’s real name is Dr. Ivo Robotnik.",
            "image": "/images/eggman.jpg"
        },
        {
            "id": "ganondorf",
            "name": "Ganondorf",
            "game": "The Legend of Zelda",
            "description": "The primary antagonist of the series, seeking power through the Triforce.",
            "abilities": "Dark magic and combat skills.",
            "trivia": "Ganondorf is the Gerudo king and the human form of Ganon.",
            "image": "/images/ganondorf.jpg"
        },
        {
            "id": "luigi",
            "name": "Luigi",
            "game": "Super Mario",
            "description": "Mario's younger brother, known for his green outfit.",
            "abilities": "Similar to Mario but with a unique jump and abilities.",
            "trivia": "Luigi first appeared in 1983 in the arcade game Mario Bros.",
            "image": "/images/luigi.jpg"
        },
        {
            "id": "tails",
            "name": "Tails",
            "game": "Sonic the Hedgehog",
            "description": "Sonic’s sidekick with twin tails that allow him to fly.",
            "abilities": "Flight and mechanical skills.",
            "trivia": "Tails was first introduced in Sonic the Hedgehog 2 in 1992.",
            "image": "/images/tails.jpg"
        },
        {
            "id": "fi",
            "name": "Fi",
            "game": "The Legend of Zelda: Skyward Sword",
            "description": "The spirit of the Master Sword, aiding Link in his journey.",
            "abilities": "Can analyze enemies and give Link information.",
            "trivia": "Fi has a calm and emotionless demeanor, unlike many characters.",
            "image": "/images/fi zelda.jpg"
        }
    ];
    // Return only the hardcoded characters
    res.json(hardcodedCharacters);
});

// Endpoint to get all character images
app.get('/api/images', async (req, res) => {
    // Hardcoded character data
    const hardcodedCharacters = [
        {
            image: "/images/mario.jpg"
        },
        {
            image: "/images/sonic.jpg"
        },
        {
            image: "/images/link.jpg"
        },
        {
            image: "/images/bowser.jpg"
        },
        {
            image: "/images/eggman.jpg"
        },
        {
            image: "/images/ganondorf.jpg"
        },
        {
            image: "/images/luigi.jpg"
        },
        {
            image: "/images/tails.jpg"
        },
        {
            image: "/images/fi zelda.jpg"
        }
    ];

    // Extract all image URLs from the hardcoded characters array
    console.log("Request received at /api/characters/api/images");
    const images = hardcodedCharacters.map(char => char.image);

    // Send the images as a response
    res.json(images);
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
    res.sendFile(join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});