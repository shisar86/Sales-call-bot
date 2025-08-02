import logging
import subprocess
import time
import requests
from twilio.rest import Client
import config

logger = logging.getLogger(__name__)

def start_ngrok():
    """
    Start ngrok tunnel in the simplest way possible.
    
    Returns:
        str: The public ngrok URL
    """
    try:
        # Start ngrok in a subprocess
        logger.info("Starting ngrok tunnel...")
        ngrok_process = subprocess.Popen(
            ["ngrok", "http", str(config.FLASK_PORT)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Give ngrok a moment to start
        time.sleep(2)
        
        # Get the public URL from ngrok API
        response = requests.get("http://localhost:4040/api/tunnels")
        tunnels = response.json()["tunnels"]
        
        if not tunnels:
            logger.error("No ngrok tunnels found")
            return None
            
        # Get the HTTPS tunnel URL
        public_url = None
        for tunnel in tunnels:
            if tunnel["proto"] == "https":
                public_url = tunnel["public_url"]
                break
        
        if not public_url:
            logger.error("No HTTPS tunnel found")
            return None
            
        logger.info(f"Ngrok tunnel established: {public_url}")
        
        # Update Twilio webhook URLs
        update_twilio_webhooks(public_url)
        
        return public_url
        
    except Exception as e:
        logger.error(f"Error starting ngrok: {e}")
        return None

def update_twilio_webhooks(public_url):
    """
    Update Twilio phone number webhooks to use the ngrok URL.
    
    Args:
        public_url: The public ngrok URL
    """
    try:
        # Initialize Twilio client
        client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
        
        # Get the phone number
        phone_numbers = client.incoming_phone_numbers.list(
            phone_number=config.TWILIO_PHONE_NUMBER
        )
        
        if not phone_numbers:
            logger.warning(f"Phone number {config.TWILIO_PHONE_NUMBER} not found in your Twilio account")
            return
        
        # Update the voice URL for the phone number
        phone_number = phone_numbers[0]
        phone_number.update(
            voice_url=f"{public_url}/voice",
            voice_method="POST",
            status_callback=f"{public_url}/call-status",
            status_callback_method="POST"
        )
        
        logger.info(f"Updated Twilio webhooks for {config.TWILIO_PHONE_NUMBER}")
        
    except Exception as e:
        logger.error(f"Error updating Twilio webhooks: {e}")
