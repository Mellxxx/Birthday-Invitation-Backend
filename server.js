// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Attendee = require('./models/Attendee');
const { v4: uuidv4 } = require('uuid'); // Ensure uuid is installed: npm install uuid
require('dotenv').config();

const app = express();

app.use(cors(
    {
        origin: 'https://invitation20.netlify.app'
    }
));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

app.post('/attendees', async (req, res) => {
    const { name, companion } = req.body;

    try {
        const rsvpCode = uuidv4(); // Generate unique code
        const attendee = new Attendee({ name, companion, rsvpCode });
        await attendee.save();
        res.status(201).json({ rsvpCode });
    } catch (err) {
        console.error('Error saving attendee:', err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/attendees', async (req, res) => {
    try {
        const attendees = await Attendee.find();
        res.json(attendees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/attendees/:rsvpCode', async (req, res) => {
    const { rsvpCode } = req.params;
    console.log('Received DELETE /attendees/:rsvpCode');
    console.log('rsvpCode:', rsvpCode);

    try {
        const attendee = await Attendee.findOneAndDelete({ rsvpCode });
        if (!attendee) {
            return res.status(404).json({ message: 'RSVP nicht gefunden' });
        }
        res.json({ message: 'RSVP erfolgreich storniert' });
    } catch (err) {
        console.error('Error deleting attendee:', err);
        res.status(500).json({ error: err.message });
    }
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
