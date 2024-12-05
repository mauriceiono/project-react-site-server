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
app.use(cors());
app.use(bodyParser.json()); // Parse JSON data from the frontend
app.use(express.static(__dirname)); // Serve static assets 
app.use('/images', express.static(join(__dirname, 'images'))); // Serve images directory

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
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

// Endpoint to get all character images
app.get('/api/images', async (req, res) => {
    try {
        const characters = await Character.find();
        const images = characters.map(char => char.image);
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching images', error: err.message });
    }
});

// New endpoint to get characters from CharacterList collection in MongoDB
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
    const image = req.file ? req.file.buffer.toString('base64') : null;

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

// Edit an existing character by ID in CharacterList (PUT)
app.put('/api/CharacterList/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const image = req.file ? req.file.buffer.toString('base64') : null;

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
            { new: true } // Return the updated document
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