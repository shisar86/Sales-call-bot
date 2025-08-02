import os
import json
import logging
import argparse
from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Gather
import config
from ngrok_manager import start_ngrok
from twilio_handler import initialize_twilio_client, make_outbound_call, call_sales_prospects
from sales_bot import get_user_info_from_call, generate_response, generate_introduction, generate_closing
from conversation import detect_conversation_end, reset_conversation
from conversation import load_conversation_history, upload_conversation_to_backend

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

@app.route("/voice", methods=['POST'])
def voice_webhook():
    response = VoiceResponse()
    call_sid = request.values.get('CallSid', '')
    caller = request.values.get('From', '')
    
    logger.info(f"Received call from {caller} with SID: {call_sid}")
    
    user_info = get_user_info_from_call(call_sid, caller)
    introduction = generate_introduction(call_sid, user_info)
    
    response.say(introduction, voice="Polly.Joanna-Neural")
    
    gather = Gather(
        input='speech',
        action='/transcribe',
        speechTimeout='auto',
        speechModel='experimental_conversations',
        language='en-US',
        hints=','.join(config.CLOSING_INDICATORS)
    )
    gather.say("Please speak after the tone.", voice="Polly.Joanna-Neural")
    response.append(gather)
    response.redirect('/voice')
    
    return str(response)

@app.route("/transcribe", methods=['POST'])
def transcribe_webhook():
    transcription = request.values.get('SpeechResult', '')
    call_sid = request.values.get('CallSid', '')

    logger.info(f"Transcription for call {call_sid}: {transcription}")
    
    response = VoiceResponse()
    is_conversation_end = detect_conversation_end(transcription)

    user_info = get_user_info_from_call(call_sid)

    if is_conversation_end:
        closing = generate_closing(call_sid, user_info)
        response.say(closing, voice="Polly.Joanna-Neural")
        response.hangup()
    else:
        bot_response = generate_response(transcription, call_sid, user_info)
        response.say(bot_response, voice="Polly.Joanna-Neural")
        
        gather = Gather(
            input='speech',
            action='/transcribe',
            speechTimeout='auto',
            speechModel='experimental_conversations',
            language='en-US',
            hints=','.join(config.CLOSING_INDICATORS)
        )
        gather.say("Please speak after the tone.", voice="Polly.Joanna-Neural")
        response.append(gather)
        response.redirect('/voice')
    
    return str(response)

@app.route("/call-status", methods=['POST'])
def call_status_webhook():
    call_sid = request.values.get('CallSid', '')
    call_status = request.values.get('CallStatus', '')
    caller = request.values.get('From', '')
    
    logger.info(f"📞 Call {call_sid} status: {call_status}")

    if call_status == "completed":
        try:
            user_info = get_user_info_from_call(call_sid, caller)
            conversation = load_conversation_history(call_sid, user_info)
            logger.info("📤 Uploading conversation to backend...")
            upload_conversation_to_backend(call_sid, conversation, user_info)
        except Exception as e:
            logger.error(f"❌ Error uploading conversation: {e}")
    
    return "OK"

@app.route("/trigger-call")
def trigger_call():
    phone = request.args.get("phone", "")
    if not phone:
        return {"error": "Phone is required"}, 400

    public_url = start_ngrok()
    if not public_url:
        return {"error": "Failed to start ngrok"}, 500

    call_sid = make_outbound_call(phone, public_url)
    return {"status": "initiated", "call_sid": call_sid}


def main():
    parser = argparse.ArgumentParser(description=f"{config.BOT_NAME} - Sales Representative for {config.COMPANY_NAME}")
    parser.add_argument("--reset", action="store_true", help="Reset conversation history")
    parser.add_argument("--mode", choices=["server", "outbound"], default="server", 
                        help="Run as webhook server or make outbound calls")
    parser.add_argument("--port", type=int, default=config.FLASK_PORT, help="Port for webhook server")
    parser.add_argument("--call", type=str, help="Phone number to call in outbound mode")
    parser.add_argument("--prospects-file", type=str, help="JSON file with prospects list for outbound calls")
    
    args = parser.parse_args()
    
    if args.reset:
        reset_conversation()
    
    if args.port:
        config.FLASK_PORT = args.port
    
    public_url = start_ngrok()
    if not public_url:
        logger.error("Failed to establish ngrok tunnel. Exiting.")
        return
    
    logger.info(f"Public URL: {public_url}")
    
    if args.mode == "server":
        logger.info(f"Starting {config.BOT_NAME} webhook server on port {config.FLASK_PORT}...")
        app.run(host='0.0.0.0', port=config.FLASK_PORT)
    
    elif args.mode == "outbound":
        if args.call:
            logger.info(f"Making outbound call to {args.call}...")
            make_outbound_call(args.call, public_url)
        elif args.prospects_file:
            try:
                with open(args.prospects_file, 'r') as f:
                    prospects = json.load(f)
                logger.info(f"Loaded {len(prospects)} prospects from {args.prospects_file}")
                call_sales_prospects(prospects, public_url)
            except Exception as e:
                logger.error(f"Error loading prospects file: {e}")
                logger.error("Please provide a valid JSON file with a list of prospects")
        else:
            logger.error("Please provide either --call or --prospects-file for outbound mode")

if __name__ == "__main__":
    main()
