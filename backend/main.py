import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")
NUM_GROUPS = 10
CATEGORIES = ["organic", "anorganic", "residual"]


def make_default_state():
    return {
        # Aggregate bins (3 bins × 3 categories) — same as before
        "bins": {
            cat: {"1": 0.0, "2": 0.0, "3": 0.0, "total": 0.0}
            for cat in CATEGORIES
        },
        # 10 groups, each tracking per-category totals + grand total
        "groups": {
            str(i): {
                "name": f"Kelompok {i}",
                "organic": 0.0,
                "anorganic": 0.0,
                "residual": 0.0,
                "total": 0.0,
            }
            for i in range(1, NUM_GROUPS + 1)
        },
    }


def load_data():
    if not os.path.exists(DATA_FILE):
        state = make_default_state()
        save_data(state)
        return state
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    # Migrate old format (no "bins"/"groups" keys) gracefully
    if "bins" not in data and "groups" not in data:
        state = make_default_state()
        # Try to preserve old bin data
        for cat in CATEGORIES:
            if cat in data:
                state["bins"][cat] = data[cat]
        save_data(state)
        return state
    return data


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
        await websocket.send_json(state)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception:
                dead.append(conn)
        for conn in dead:
            self.active_connections.remove(conn)


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"status": "TrashTrack running", "connections": len(manager.active_connections)}


@app.get("/state")
async def get_state():
    return state


@app.post("/reset")
async def reset_state():
    global state
    state = make_default_state()
    save_data(state)
    await manager.broadcast(state)
    return {"status": "reset ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)

            category = payload.get("category")   # "organic" | "anorganic" | "residual"
            bin_num  = payload.get("bin")         # "1" | "2" | "3"
            group_id = payload.get("group")       # "1" … "10"
            amount   = float(payload.get("amount", 0))

            # ── Validate ──────────────────────────────────────────────────────
            if category not in CATEGORIES:
                await websocket.send_json({"error": f"Unknown category: {category}"}); continue
            if bin_num not in ("1", "2", "3"):
                await websocket.send_json({"error": f"Unknown bin: {bin_num}"}); continue
            if group_id not in state["groups"]:
                await websocket.send_json({"error": f"Unknown group: {group_id}"}); continue

            # ── Update aggregate bins ─────────────────────────────────────────
            state["bins"][category][bin_num] += amount
            state["bins"][category]["total"] = sum(
                state["bins"][category][str(i)] for i in range(1, 4)
            )

            # ── Update group totals ───────────────────────────────────────────
            state["groups"][group_id][category] += amount
            state["groups"][group_id]["total"] = sum(
                state["groups"][group_id][c] for c in CATEGORIES
            )

            save_data(state)
            await manager.broadcast(state)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
