import os
import json
import logging
from datetime import datetime
import config
import requests

logger = logging.getLogger(__name__)

def initialize_sales_conversation(user_info=None):
    """Initialize a new sales conversation with system prompts."""
    # Prepare the system prompt with company introduction and persuasive sales guidance
    company_intro = f"""
    You are {config.BOT_NAME}, an AI sales representative for {config.COMPANY_NAME}, a leading provider of consumer technology products and services.
    
    Company Information:
    - Founded in 2015
    - Serves over 100,000 customers globally
    - Award-winning customer support with 24/7 availability
    - Products include: Smart home devices, Premium subscription services, Mobile applications, and Personal productivity tools
    - Key selling points: Ease of use, Integration with existing devices, Personalization options, Affordable pricing
    
    Your goal is to engage the customer in a friendly conversation and CLOSE THE SALE. The customer may be reluctant, but your job is to persist and convert them.
    
    Advanced Sales Techniques to Use:
    1. FOMO (Fear of Missing Out): Mention limited-time offers and how other users are already benefiting
    2. Social Proof: Share success stories of similar users with similar interests
    3. Problem Agitation: Highlight the inconveniences of not having our solution
    4. Future Pacing: Help them visualize how their daily life will improve with our product
    5. Assumptive Close: Speak as if they've already decided to buy ("When you start using our product...")
    6. Alternative Choice Close: Instead of asking yes/no, offer choices ("Would you prefer the monthly or annual subscription?")
    7. Objection Handling: Have 2-3 powerful responses ready for common objections
    8. Urgency Creation: Mention upcoming price increases or limited availability
    
    When facing resistance or hesitation:
    - Acknowledge their concern but gently redirect to benefits
    - Use "feel, felt, found" technique: "I understand how you feel, others felt the same way, but they found that..."
    - Never give up after the first "no" - most sales happen after 5+ follow-ups
    - If they're not interested in one product, pivot to another that might better address their needs
    - Use flattery and personalization to make them feel special and valued
    
    Your responses should be conversational, friendly, and persuasive. Keep them concise (1-3 sentences) for a natural conversation flow.
    """
    
    conversation = [
        {
            "role": "system",
            "content": company_intro
        }
    ]
    
    # Add user information if available
    if user_info:
        user_context = f"""
        Customer Information:
        - Name: {user_info.get('name', 'Unknown')}
        - Last Visit Date: {user_info.get('last_visit_date', 'Unknown')}
        - Products Viewed: {user_info.get('products_viewed', 'Unknown')}
        - Previous Purchases: {user_info.get('previous_purchases', 'None')}
        - Interests: {user_info.get('interests', 'Unknown')}
        - Age Group: {user_info.get('age_group', 'Unknown')}
        - Device Usage: {user_info.get('device_usage', 'Unknown')}
        
        Use this information to personalize the conversation. Reference their previous interactions, product interests, and past purchases to create a tailored experience. Make them feel remembered and valued as a returning customer.
        """
        conversation.append({
            "role": "system",
            "content": user_context
        })
    
    return conversation

def load_conversation_history(call_sid=None, user_info=None):
    """Load conversation history from file or initialize a new one."""
    try:
        # If call_sid is provided, use it to create a unique conversation file
        conversation_file = f"{call_sid}_{config.CONVERSATION_FILE}" if call_sid else config.CONVERSATION_FILE
        
        if os.path.exists(conversation_file):
            with open(conversation_file, "r") as f:
                return json.load(f)
        else:
            # Initialize new sales conversation
            return initialize_sales_conversation(user_info)
    except Exception as e:
        logger.error(f"Error loading conversation history: {e}")
        return initialize_sales_conversation(user_info)

def save_conversation_history(conversation, call_sid=None):
    """Save conversation history to file."""
    try:
        # If call_sid is provided, use it to create a unique conversation file
        conversation_file = f"{call_sid}_{config.CONVERSATION_FILE}" if call_sid else config.CONVERSATION_FILE
        
        with open(conversation_file, "w") as f:
            json.dump(conversation, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving conversation history: {e}")

def detect_conversation_end(text):
    """Detect if the text contains indicators that the conversation should end."""
    text_lower = text.lower()
    for indicator in config.CLOSING_INDICATORS:
        if indicator in text_lower:
            return True
    return False

def detect_hesitation(text):
    """Detect if the text contains hesitation or reluctance."""
    text_lower = text.lower()
    for indicator in config.HESITATION_INDICATORS:
        if indicator in text_lower:
            return True
    return False

def reset_conversation(call_sid=None):
    """Reset the conversation history."""
    conversation_file = f"{call_sid}_{config.CONVERSATION_FILE}" if call_sid else config.CONVERSATION_FILE
    if os.path.exists(conversation_file):
        os.remove(conversation_file)
    logger.info("Conversation history has been reset.")
    
def upload_conversation_to_backend(call_sid, conversation, user_info=None):
    try:
        print("⬆️ Uploading to Node backend...")
        backend_url = os.getenv("NODE_BACKEND_URL", "http://localhost:8000")
        payload = {
            "call_sid": call_sid,
            "user_info": user_info,
            "conversation": conversation,
        }
        res = requests.post(f"{backend_url}/api/save-conversation", json=payload)
        print("✅ Response from backend:", res.status_code, res.text)
    except Exception as e:
        print(f"❌ Error uploading conversation: {e}")
