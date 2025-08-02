import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# File paths
CONVERSATION_FILE = "conversation.json"

# Sales Bot Configuration
BOT_NAME = "Alex"
COMPANY_NAME = "TechInnovate Solutions"

# OpenAI API Configuration
API_BASE_URL = os.getenv("API_BASE_URL")
API_KEY = os.getenv("API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")

# Flask Configuration
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))

# Conversation indicators
CLOSING_INDICATORS = [
    "bye", "goodbye", "see you", "talk to you later", "that's all", 
    "thank you", "thanks for your help", "end", "quit", "exit",
    "have a good day", "have a nice day", "that's it", "that will be all"
]

HESITATION_INDICATORS = [
    "not sure", "maybe later", "think about it", "too expensive", 
    "can't afford", "not ready", "need time", "let me think", 
    "not convinced", "don't know", "hesitant", "uncertain",
    "on the fence", "not now", "possibly", "might", "perhaps"
]
