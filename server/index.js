import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import Conversation from "./models/Conversation.js";
import axios from 'axios';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/save-conversation", async (req, res) => {
  try {
    console.log("📥 Received conversation:", req.body);
    const convo = await Conversation.create(req.body);
    res.json({ message: "Conversation saved", id: convo._id });
  } catch (err) {
    console.error("❌ Failed to save:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/call", async (req, res) => {
  try {
    console.log("📞 Incoming call request:", req.body);
    const { phone } = req.body;
    const response = await axios.get(`${process.env.FLASK_URL}/trigger-call?phone=${phone}`);
    console.log("✅ Flask responded:", response.data);
    res.json({ message: "Call triggered", data: response.data });
  } catch (err) {
    console.error("Error in /api/call:", err.message);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/conversations", async (req, res) => {
  const conversations = await Conversation.find().sort({ createdAt: -1 });
  res.json(conversations);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
