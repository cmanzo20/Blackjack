require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Replace this with your actual MongoDB connection string
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

app.use(cors());
app.use(express.json());

// Define a schema and model for leaderboard entries
const leaderboardSchema = new mongoose.Schema({
  name: String,
  score: Number
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Get the leaderboard (top 10 scores)
app.get('/leaderboard', async (req, res) => {
  try {
    const topPlayers = await Leaderboard.find().sort({score: -1}).limit(10);
    res.json(topPlayers);
  } catch(err) {
    res.status(500).send("Error fetching leaderboard");
  }
});

// Add a new score
app.post('/leaderboard', async (req, res) => {
  const { name, score } = req.body;
  if(!name || typeof score !== 'number'){
    return res.status(400).send("Name and score are required");
  }
  try {
    const entry = new Leaderboard({ name, score });
    await entry.save();
    res.status(201).send("Score added");
  } catch(err) {
    res.status(500).send("Error saving score");
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
