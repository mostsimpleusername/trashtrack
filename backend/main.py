import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Allow CORS from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")

# Default state if data.json doesn't exist
DEFAULT_STATE = {
    "organic": {"1": 0, "2": 0, "3": 0, "total": 0},
    "anorganic": {"1": 0, "2": 0, "3": 0, "total": 0},
    "residual": {"1": 0, "2": 0, "3": 0, "total": 0}
}

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_STATE)
        return json.loads(json.dumps(DEFAULT_STATE))
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

state = load_data()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send current state immediately upon connection
        await websocket.send_json(state)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections.remove(conn)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"status": "TrashTrack backend running", "connections": len(manager.active_connections)}

@app.get("/state")
async def get_state():
    return state

@app.post("/reset")
async def reset_state():
    global state
    state = json.loads(json.dumps(DEFAULT_STATE))
    save_data(state)
    await manager.broadcast(state)
    return {"status": "reset successful"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for input from the React frontend
            data = await websocket.receive_text()
            payload = json.loads(data)

            # Extract data
            category = payload.get("category")
            bin_num = payload.get("bin")
            amount = float(payload.get("amount", 0))

            # Validate category and bin
            if category not in state:
                await websocket.send_json({"error": f"Unknown category: {category}"})
                continue
            if bin_num not in state[category]:
                await websocket.send_json({"error": f"Unknown bin: {bin_num}"})
                continue

            # Update the specific bin
            state[category][bin_num] += amount

            # Recalculate total for that category
            state[category]["total"] = sum(state[category][str(i)] for i in range(1, 4))

            # Save to JSON and broadcast to all screens
            save_data(state)
            await manager.broadcast(state)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)
