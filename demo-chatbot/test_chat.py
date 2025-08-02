from sales_bot import generate_response, get_user_info_from_call
from conversation import load_conversation_history, save_conversation_history
import uuid

# Simulate a fake call SID
call_sid = "TEST_" + str(uuid.uuid4())[:8]
caller = "+1234567890"  # dummy phone number

# Step 1: Simulate user profile generation
user_info = get_user_info_from_call(call_sid, caller)

print("\n🤖 Alex (AI Sales Agent) is ready to chat with you...\n")

# Step 2: Simulate conversation loop
while True:
    user_input = input("🧑 You: ")

    if user_input.lower() in ["exit", "quit", "bye"]:
        print("🤖 Alex: Thanks for your time. Goodbye!")
        break

    # Load history
    conversation = load_conversation_history(call_sid, user_info)

    # Append user message
    conversation.append({"role": "user", "content": user_input})

    # Get AI reply
    bot_reply = generate_response(user_input, call_sid, user_info)

    # Append bot message
    conversation.append({"role": "assistant", "content": bot_reply})
    save_conversation_history(call_sid, conversation)

    print(f"🤖 Alex: {bot_reply}")
