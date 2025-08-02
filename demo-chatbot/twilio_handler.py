import logging
from twilio.rest import Client
import config

logger = logging.getLogger(__name__)

def initialize_twilio_client():
    """Initialize and return a Twilio client."""
    return Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)

def make_outbound_call(to_number, webhook_url, user_info=None):
    """
    Make an outbound call using Twilio.
    
    Args:
        to_number: The phone number to call
        webhook_url: The base webhook URL
        user_info: User information dictionary
    """
    try:
        client = initialize_twilio_client()
        
        # Make the call
        call = client.calls.create(
            to=to_number,
            from_=config.TWILIO_PHONE_NUMBER,
            url=f"{webhook_url}/voice",
            status_callback=f"{webhook_url}/call-status",
            status_callback_method="POST"
        )
        
        logger.info(f"Call initiated with SID: {call.sid}")
        return call.sid
        
    except Exception as e:
        logger.error(f"Error making outbound call: {e}")
        return None

def call_sales_prospects(prospects_list, webhook_url):
    """
    Make outbound sales calls to a list of prospects.
    
    Args:
        prospects_list: List of dictionaries containing prospect information
                        Each dict should have 'phone' and optionally 'user_info'
        webhook_url: The base webhook URL
    """
    import time
    
    for prospect in prospects_list:
        phone_number = prospect.get('phone')
        user_info = prospect.get('user_info')
        
        if phone_number:
            logger.info(f"Calling prospect at {phone_number}...")
            call_sid = make_outbound_call(phone_number, webhook_url, user_info)
            
            if call_sid:
                logger.info(f"Call initiated to {phone_number} with SID: {call_sid}")
            else:
                logger.error(f"Failed to initiate call to {phone_number}")
            
            # Wait a few seconds between calls to avoid rate limiting
            time.sleep(3)
        else:
            logger.warning("Skipping prospect with no phone number")
