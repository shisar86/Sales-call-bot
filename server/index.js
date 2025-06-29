import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import Conversation from "./models/Conversation.js";
import Product from './models/Product.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Add product (admin only)
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, description, quantity } = req.body;
    if (!name || !price || !description || quantity === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const product = await Product.create({ name, price, description, quantity });
    res.json({ message: "Product added", product });
  } catch (err) {
    console.error("❌ Failed to add product:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all products from MongoDB
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product quantity (admin only)
app.patch("/api/products/:id/quantity", async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { quantity } },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reduce product quantity when user buys
app.post("/api/products/:id/buy", async (req, res) => {
  try {
    const { qty } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.quantity < qty) return res.status(400).json({ error: "Not enough stock" });
    product.quantity -= qty;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/conversations", async (req, res) => {
  const conversations = await Conversation.find().sort({ createdAt: -1 });
  res.json(conversations);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
