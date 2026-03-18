#!/bin/bash
API_URL="http://localhost:8088/api/v1"
ADMIN_USER="super_admin"
ADMIN_PASS="changeme123"

echo "Logging in as $ADMIN_USER..."
# Corrected curl with line continuations
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")

TOKEN=$(echo $LOGIN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Login failed. Response: $LOGIN_RES"
  echo "Trying default password if changeme123 failed (initial setup might require changeme123)..."
  exit 1
fi

echo "Login successful. Token obtained."

api_call() {
  method=$1
  path=$2
  data=$3
  curl -s -X "$method" "$API_URL$path" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$data"
}

echo "Resetting existing configurations..."
for key in title competition team match news sponsor review join-request; do
  api_call "DELETE" "/entity-definitions/$key" "" > /dev/null
done

MENU_ITEMS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/menu/manage" | jq -r '.[].id')
if [ "$MENU_ITEMS" != "null" ]; then
    for id in $MENU_ITEMS; do
      api_call "DELETE" "/menu/manage/$id" "" > /dev/null
    done
fi

echo "Creating groups..."
api_call "POST" "/groups" '{"name": "players", "description": "Esports Players"}'
api_call "POST" "/groups" '{"name": "casters", "description": "Commentators"}'
api_call "POST" "/groups" '{"name": "sponsors", "description": "Sponsors"}'

echo "Creating Entity Definitions..."
api_call "POST" "/entity-definitions" '{"entityKey": "title", "label": "Giochi", "fields": [{ "name": "name", "type": "STRING", "required": true }, { "name": "publisher", "type": "STRING", "required": true }, { "name": "image", "type": "STRING", "required": false }, { "name": "description", "type": "STRING", "required": false }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "competition", "label": "Competizioni", "fields": [{ "name": "name", "type": "STRING", "required": true }, { "name": "titleId", "type": "STRING", "required": true }, { "name": "status", "type": "ENUM", "required": true, "enumValues": ["draft", "active", "upcoming", "completed"] }, { "name": "prizePool", "type": "STRING", "required": false }, { "name": "image", "type": "STRING", "required": false }, { "name": "startDate", "type": "DATE", "required": true }, { "name": "endDate", "type": "DATE", "required": true }, { "name": "format", "type": "ENUM", "required": true, "enumValues": ["single_elimination", "double_elimination", "round_robin", "swiss"] }, { "name": "matchRules", "type": "NUMBER", "required": true }, { "name": "maxTeams", "type": "NUMBER", "required": true }, { "name": "minPlayers", "type": "NUMBER", "required": true }, { "name": "maxPlayers", "type": "NUMBER", "required": true }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "team", "label": "Team", "fields": [{ "name": "name", "type": "STRING", "required": true }, { "name": "logo", "type": "STRING", "required": false }, { "name": "founded", "type": "STRING", "required": false }, { "name": "captainId", "type": "STRING", "required": true }, { "name": "description", "type": "STRING", "required": false }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "match", "label": "Match", "fields": [{ "name": "competitionId", "type": "STRING", "required": true }, { "name": "teamA", "type": "STRING", "required": true }, { "name": "teamB", "type": "STRING", "required": true }, { "name": "scoreA", "type": "NUMBER", "required": false }, { "name": "scoreB", "type": "NUMBER", "required": false }, { "name": "date", "type": "STRING", "required": true }, { "name": "status", "type": "ENUM", "required": true, "enumValues": ["scheduled", "live", "completed", "disputed"] }, { "name": "casterId", "type": "STRING", "required": false }, { "name": "round", "type": "STRING", "required": false }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "news", "label": "News", "fields": [{ "name": "title", "type": "STRING", "required": true }, { "name": "image", "type": "STRING", "required": false }, { "name": "date", "type": "STRING", "required": true }, { "name": "excerpt", "type": "STRING", "required": true }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "sponsor", "label": "Sponsors", "fields": [{ "name": "name", "type": "STRING", "required": true }, { "name": "logo", "type": "STRING", "required": false }, { "name": "description", "type": "STRING", "required": false }, { "name": "siteUrl", "type": "STRING", "required": false }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "review", "label": "Recensioni Caster", "fields": [{ "name": "casterId", "type": "STRING", "required": true }, { "name": "authorName", "type": "STRING", "required": true }, { "name": "rating", "type": "NUMBER", "required": true }, { "name": "comment", "type": "STRING", "required": true }]}'
api_call "POST" "/entity-definitions" '{"entityKey": "join-request", "label": "Richieste Join Team", "fields": [{ "name": "teamId", "type": "STRING", "required": true }, { "name": "userId", "type": "STRING", "required": true }, { "name": "userName", "type": "STRING", "required": true }, { "name": "status", "type": "ENUM", "required": true, "enumValues": ["pending", "accepted", "rejected"] }]}'

echo "Creating Menu items..."
api_call "POST" "/menu/manage" '{"label": "Tornei", "entityKey": "competition", "icon": "emoji_events", "position": 1}'
api_call "POST" "/menu/manage" '{"label": "Team", "entityKey": "team", "icon": "groups", "position": 2}'
api_call "POST" "/menu/manage" '{"label": "News", "entityKey": "news", "icon": "newspaper", "position": 3}'

echo "Seeding data..."
api_call "POST" "/records/title" '{"data": {"name": "Valorant", "publisher": "Riot Games", "image": "https://picsum.photos/seed/val/400/200", "description": "A 5v5 tactical shooter."}}'
api_call "POST" "/records/title" '{"data": {"name": "Rocket League", "publisher": "Psyonix", "image": "https://picsum.photos/seed/rl/400/200", "description": "Soccer with cars."}}'

echo "Setup complete!"
