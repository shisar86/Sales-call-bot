import os
import openai
import speech_recognition as sr
import pyttsx3
from dotenv import load_dotenv

# Load API key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize speech engine
engine = pyttsx3.init()
engine.setProperty("rate", 160)

# AI system prompt
conversation = [
    {
        "role": "system",
        "content": """
        You are Alex, an AI sales representative for TechInnovate Solutions.
        Your job is to sell smart home devices and subscription services to customers.
        Be friendly, persuasive, and use professional sales techniques.
        """
    }
]

# Initialize recognizer
r = sr.Recognizer()

print("🎙️ Speak into your mic. Say 'goodbye' to end.\n")

while True:
    try:
        with sr.Microphone() as source:
            print("🧑 You: ", end="", flush=True)
            audio = r.listen(source)
            user_input = r.recognize_google(audio)
            print(user_input)

            if "goodbye" in user_input.lower():
                response = "Thank you for your time. Have a great day!"
                engine.say(response)
                engine.runAndWait()
                print("🤖 Alex:", response)
                break

            # Add user message to history
            conversation.append({"role": "user", "content": user_input})

            # Call OpenAI
            reply = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=conversation
            )

            bot_message = reply.choices[0].message['content']
            conversation.append({"role": "assistant", "content": bot_message})

            # Speak response
            print("🤖 Alex:", bot_message)
            engine.say(bot_message)
            engine.runAndWait()

    except sr.UnknownValueError:
        print("❌ Could not understand audio. Please try again.")
    except sr.RequestError as e:
        print("❌ API error:", e)
    except Exception as ex:
        print("❌ Unexpected error:", ex)
