import subprocess
import sys
import os

def main():
    # Default values
    instructions = None
    voice = None
    temperature = None
    room = None
    opening_line = None
    agent_id = None
    # Parse command line arguments
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--instructions":
            instructions = args[i+1]
            i += 2
        elif args[i] == "--voice":
            voice = args[i+1]
            i += 2
        elif args[i] == "--temperature":
            temperature = args[i+1]
            i += 2
        elif args[i] == "--room":
            room = args[i+1]
            i += 2
        elif args[i] == "--opening_line":
            opening_line = args[i+1]
            i += 2
        elif args[i] == "--agent_id":
            agent_id = args[i+1]
            i += 2
        elif args[i] == "--user_id":
            user_id = args[i+1]
            i += 2
        else:
            i += 1

    # Set environment variables
    os.environ['AGENT_INSTRUCTIONS'] = instructions
    os.environ['AGENT_VOICE_ID'] = voice
    os.environ['AGENT_TEMPERATURE'] = temperature
    os.environ['AGENT_OPENING_LINE'] = opening_line
    os.environ['AGENT_ID'] = agent_id
    os.environ['USER_ID'] = user_id

    # Construct the command to run open.py
    command = ["python", "services/voice/openny.py", "connect"]
    if room:
        command.extend(["--room", room])

    # Run open.py with the updated environment variables
    subprocess.run(command, env=os.environ)

if __name__ == "__main__":
    main()
