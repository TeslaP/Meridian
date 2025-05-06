#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001"

# Function to make API calls with proper JSON formatting
make_request() {
    local endpoint=$1
    local data=$2
    echo -e "${BLUE}Testing $endpoint...${NC}"
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL$endpoint" | jq '.'
    echo
}

# Test each character systematically
echo -e "${GREEN}Starting character interaction tests...${NC}\n"

# Test Dr. Alexander Volkov (The Professor)
echo -e "${GREEN}Testing Dr. Alexander Volkov...${NC}"
make_request "/api/chat" '{"character": "professor", "message": "What is your research about?", "trustLevel": 0}'
make_request "/api/chat" '{"character": "professor", "message": "Tell me about your work at the institute.", "trustLevel": 1}'
make_request "/api/chat" '{"character": "professor", "message": "What happened to your research?", "trustLevel": 2}'

# Test Madame Elena Petrovna (The Widow)
echo -e "${GREEN}Testing Madame Elena Petrovna...${NC}"
make_request "/api/chat" '{"character": "widow", "message": "Why are you traveling alone?", "trustLevel": 0}'
make_request "/api/chat" '{"character": "widow", "message": "What happened to your husband?", "trustLevel": 1}'
make_request "/api/chat" '{"character": "widow", "message": "What is in your mysterious package?", "trustLevel": 2}'

# Test Boris "The Fixer" (The Mechanic)
echo -e "${GREEN}Testing Boris The Fixer...${NC}"
make_request "/api/chat" '{"character": "mechanic", "message": "How long have you worked on this train?", "trustLevel": 0}'
make_request "/api/chat" '{"character": "mechanic", "message": "What kind of repairs do you handle?", "trustLevel": 1}'
make_request "/api/chat" '{"character": "mechanic", "message": "Have you noticed anything unusual about the train?", "trustLevel": 2}'

# Test Anya (The Child)
echo -e "${GREEN}Testing Anya...${NC}"
make_request "/api/chat" '{"character": "child", "message": "Where are your parents?", "trustLevel": 0}'
make_request "/api/chat" '{"character": "child", "message": "What is that music box you have?", "trustLevel": 1}'
make_request "/api/chat" '{"character": "child", "message": "Why are you traveling alone?", "trustLevel": 2}'

# Test Commissar Ivanov (The Official)
echo -e "${GREEN}Testing Commissar Ivanov...${NC}"
make_request "/api/chat" '{"character": "official", "message": "What is the purpose of your journey?", "trustLevel": 0}'
make_request "/api/chat" '{"character": "official", "message": "Are you investigating something?", "trustLevel": 1}'
make_request "/api/chat" '{"character": "official", "message": "What do you know about the other passengers?", "trustLevel": 2}'

# Test item discovery
echo -e "${GREEN}Testing item discovery...${NC}"
make_request "/api/discover" '{"character": "professor", "item": "research_notes"}'
make_request "/api/discover" '{"character": "widow", "item": "mysterious_package"}'
make_request "/api/discover" '{"character": "mechanic", "item": "toolbox"}'
make_request "/api/discover" '{"character": "child", "item": "music_box"}'
make_request "/api/discover" '{"character": "official", "item": "official_documents"}'

# Test biography updates
echo -e "${GREEN}Testing biography updates...${NC}"
make_request "/api/biography" '{"character": "professor", "trustLevel": 2}'
make_request "/api/biography" '{"character": "widow", "trustLevel": 2}'
make_request "/api/biography" '{"character": "mechanic", "trustLevel": 2}'
make_request "/api/biography" '{"character": "child", "trustLevel": 2}'
make_request "/api/biography" '{"character": "official", "trustLevel": 2}'

echo -e "${GREEN}All tests completed!${NC}" 