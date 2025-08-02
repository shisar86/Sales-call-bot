import logging
from openai import OpenAI
import config
from conversation import load_conversation_history, save_conversation_history, detect_hesitation

logger = logging.getLogger(__name__)

# Initialize OpenAI client once
client = OpenAI(
    base_url=config.API_BASE_URL,
    api_key=config.API_KEY,
)

def get_user_info_from_call(call_sid=None, phone_number=None):
    """Simulate fetching user info from CRM based on phone number or SID."""
    return {
        "name": "Michael",
        "last_visit_date": "April 10, 2025",
        "products_viewed": "Smart Home Hub, Voice Assistant Speaker",
        "previous_purchases": "Annual Premium Subscription (expired last month)",
        "interests": "Home automation, Music streaming, Productivity apps",
        "age_group": "30-45",
        "device_usage": "Smartphone, Laptop, Smart TV"
    }

def generate_response(input_text, call_sid=None, user_info=None):
    try:
        logger.info("Generating response...")

        conversation = load_conversation_history(call_sid, user_info)

        if detect_hesitation(input_text):
            conversation.append({
                "role": "system",
                "content": (
                    "The customer is showing hesitation. Use flattery and personalization to make them feel special. "
                    "Compliment their taste, insight, or decision-making process. Focus on how they specifically will benefit "
                    "from our product in ways that align with their interests and lifestyle. Use phrases like "
                    "'Someone with your taste would appreciate...' or 'Given your interest in "
                    f"{user_info.get('interests', 'technology')}, you'd especially enjoy...'."
                )
            })

        conversation.append({
            "role": "user",
            "content": input_text
        })

        response = client.chat.completions.create(
            messages=conversation,
            model=config.MODEL_NAME,
            temperature=0.7,
            max_tokens=150,
            top_p=0.9
        )

        result = response.choices[0].message.content

        conversation.append({
            "role": "assistant",
            "content": result
        })

        # Clean up hesitation system message
        conversation = [
            msg for msg in conversation
            if not (msg["role"] == "system" and "The customer is showing hesitation" in msg.get("content", ""))
        ]

        save_conversation_history(call_sid, conversation)
        logger.info(f"Response: {result}")
        return result

    except Exception as e:
        logger.error(f"Error in response generation: {e}")
        return "I'm sorry, I couldn't generate a response at this time. Please try again."

def generate_introduction(call_sid=None, user_info=None):
    try:
        conversation = load_conversation_history(call_sid, user_info)

        prompt = f"As {config.BOT_NAME}, generate a warm, personalized introduction to start the sales call."
        if user_info:
            prompt += f" Address {user_info.get('name', '')} by name."
            if user_info.get('last_visit_date'):
                prompt += f" Mention their last visit on {user_info['last_visit_date']}."
            if user_info.get('products_viewed'):
                prompt += f" Reference their interest in {user_info['products_viewed']}."
            if user_info.get('previous_purchases'):
                prompt += f" Acknowledge their previous purchase of {user_info['previous_purchases']}."
        prompt += " Ask an open-ended question about their needs or interests. Be friendly, conversational, and enthusiastic. Keep it concise (2-3 sentences)."

        conversation.append({
            "role": "user",
            "content": prompt
        })

        response = client.chat.completions.create(
            messages=conversation,
            model=config.MODEL_NAME,
            temperature=0.7,
            max_tokens=150,
            top_p=0.9
        )

        introduction = response.choices[0].message.content

        # Remove the user-prompt from history and add assistant intro
        conversation.pop()
        conversation.append({
            "role": "assistant",
            "content": introduction
        })

        save_conversation_history(call_sid, conversation)
        return introduction

    except Exception as e:
        logger.error(f"Error generating introduction: {e}")
        return f"Hello, this is {config.BOT_NAME} from {config.COMPANY_NAME}. How can I help you today?"

def generate_closing(call_sid=None, user_info=None):
    try:
        conversation = load_conversation_history(call_sid, user_info)
        conversation.append({
            "role": "system",
            "content": (
                "The conversation is ending. Generate a warm, friendly closing statement that thanks the customer for their time, "
                "summarizes any commitments or next steps, and includes a clear call to action. Mention a special offer or limited-time "
                "discount if appropriate to encourage immediate action. Keep it concise and personalized."
            )
        })

        response = client.chat.completions.create(
            messages=conversation,
            model=config.MODEL_NAME,
            temperature=0.7,
            max_tokens=150,
            top_p=0.9
        )

        closing = response.choices[0].message.content
        return closing

    except Exception as e:
        logger.error(f"Error generating closing: {e}")
        return (
            f"Thank you for your time today. If you'd like to try our products, we're offering a special 15% discount for new customers. "
            "Just visit our website or call us back when you're ready. Have a wonderful day!"
        )
