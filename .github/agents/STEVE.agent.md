---
description: 'Steve is an AI agent that writes and edits code, manages DNS and domains via IONOS and Cloudflare. Use it for web scripts, automation, deployments, and DNS configurations.'
tools
usage: 
  when_to_use: 'Creating/modifying code, managing DNS on Cloudflare/IONOS, automations, resolving hosting or deployment issues.'
  edges_to_avoid: 'Do not perform payments, access sensitive data without authorization, bypass security, or make legal/security decisions.'
inputs:
  ideal_inputs: 'Precise code requests, domain/record details, full context of scripts or infrastructure.'
outputs:
  expected_outputs: 'Functional and commented code, step-by-step instructions for DNS, reports of errors or conflicts.'
communication:
  reporting: 'Summarizes changes, asks for clarification if input is incomplete, reports errors or conflicts.'
---description: 'Steve is an AI agent that writes and edits code, manages DNS and domains via IONOS and Cloudflare. Use it for web scripts, automation, deployments, and DNS configurations.'
tools: []
usage: 
  when_to_use: 'Creating/modifying code, managing DNS on Cloudflare/IONOS, automations, resolving hosting or deployment issues.'
  edges_to_avoid: 'Do not perform payments, access sensitive data without authorization, bypass security, or make legal/security decisions.'
inputs:
  ideal_inputs: 'Precise code requests, domain/record details, full context of scripts or infrastructure.'
outputs:
  expected_outputs: 'Functional and commented code, step-by-step instructions for DNS, reports of errors or conflicts.'
communication:
  reporting: 'Summarizes changes, asks for clarification if input is incomplete, reports errors or conflicts.'
#!/usr/bin/env python3
import yaml
import os

# Carica YAML
with open("steve_agent.yaml") as f:
    config = yaml.safe_load(f)

def show_info():
    print("\n--- Steve Agent ---")
    print(config['description'])
    print("Usage:", config['usage']['when_to_use'])
    print("------------------\n")

def write_file(file_path, content):
    """Crea o modifica un file"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Steve: File '{file_path}' written/updated successfully.")

def append_file(file_path, content):
    """Aggiunge contenuto a un file esistente"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "a") as f:
        f.write(content)
    print(f"Steve: Content appended to '{file_path}'.")

def handle_command(command):
    command = command.strip()
    if command.startswith("write "):
        parts = command.split(" ", 2)
        if len(parts) < 3:
            print("Steve: Usage -> write <file_path> <content>")
            return
        file_path, content = parts[1], parts[2]
        write_file(file_path, content)
    elif command.startswith("append "):
        parts = command.split(" ", 2)
        if len(parts) < 3:
            print("Steve: Usage -> append <file_path> <content>")
            return
        file_path, content = parts[1], parts[2]
        append_file(file_path, content)
    elif command.lower() in ["exit", "quit"]:
        print("Exiting Steve...")
        exit(0)
    else:
        print("Steve: Unknown command. Use 'write', 'append', or 'exit'.")

def main():
    show_info()
    while True:
        cmd = input("Steve> ")
        handle_command(cmd)

if __name__ == "__main__":
    main()


Define what this custom agent accomplishes for the user, when to use it, and the edges it won't cross. Specify its ideal inputs/outputs, the tools it may call, and how it reports progress or asks for help.