import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: String,
  content: String,
});

const conversationSchema = new mongoose.Schema({
  call_sid: String,
  user_info: Object,
  conversation: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Conversation", conversationSchema);
