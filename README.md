# 🗑️ TrashTrack

Sistem monitoring sampah real-time untuk acara **Runmadhan 2026**, dikelola oleh **Bank Sampah Amal Haqiqi**.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8?style=flat-square&logo=tailwindcss)
![Stack](https://img.shields.io/badge/Realtime-WebSocket-orange?style=flat-square)

---

## ✨ Fitur

- 📊 **Dashboard real-time** — data berat sampah diperbarui secara instan di semua perangkat
- ➕ **Input System** — tambah berat sampah per kategori dan per bin dengan mudah
- 🔄 **WebSocket broadcast** — semua tab/device sinkron otomatis
- 💾 **Persistensi data** — data disimpan ke `data.json` dan tetap ada saat server restart
- 🌐 **Multi-device** — bisa dibuka di HP dan komputer secara bersamaan

## 📦 Kategori Sampah

| Kategori     | Keterangan                                  |
| ------------ | ------------------------------------------- |
| 🌿 Organik   | Sampah organik (daun, sisa makanan, dll)    |
| ♻️ Anorganik | Sampah anorganik (plastik, kertas, logam)   |
| 🗑️ Residu    | Sampah residu yang tidak dapat didaur ulang |

Setiap kategori memiliki **3 bin**, dan total per kategori dihitung otomatis.

---

## 🚀 Cara Menjalankan

### Prasyarat

- Python 3.9+
- Node.js 18+

### 1. Clone repository

```bash
git clone https://github.com/mostsimpleusername/trashtrack
cd trashtrack
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install fastapi uvicorn websockets pydantic
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend berjalan di: `http://localhost:8000`

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

### 4. Akses dari HP (opsional)

```bash
# Jalankan frontend dengan flag --host
npm run dev -- --host
```

Buka IP lokal yang ditampilkan (contoh: `http://192.168.1.x:5173`) di browser HP kamu.

---

## 📁 Struktur Proyek

```
trashtrack/
├── backend/
│   ├── main.py        # FastAPI app + WebSocket handler
│   ├── data.json      # Penyimpanan data (auto-generated)
│   └── venv/          # Python virtual environment
└── frontend/
    ├── src/
    │   ├── App.jsx    # Komponen utama + logika WebSocket
    │   └── index.css  # Global styles + Tailwind
    ├── index.html
    └── package.json
```

## 🔌 API Endpoints

| Method | Endpoint | Keterangan                                    |
| ------ | -------- | --------------------------------------------- |
| `WS`   | `/ws`    | WebSocket — terima & broadcast data real-time |
| `GET`  | `/state` | Ambil state terkini                           |
| `POST` | `/reset` | Reset semua data ke 0                         |

---

## 🛠️ Tech Stack

- **Backend:** FastAPI, Uvicorn, WebSockets, Pydantic
- **Frontend:** React 18, Vite, Tailwind CSS v4
- **Komunikasi:** WebSocket (real-time, bi-directional)
- **Storage:** JSON file (lightweight, no database needed)

---

_Terima kasih telah bertanggung jawab memilah sampah dan menjaga bumi 🌿_
