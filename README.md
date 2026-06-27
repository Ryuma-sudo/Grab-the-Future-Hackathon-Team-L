# Grab Last-Mile EV Rental

## Problem

## Solution

## Features

- View electric vehicle stations on a mobile-first map interface.
- See station availability, including available vehicles and total vehicles.
- Select a departure station and preview destination station cost estimates.
- View vehicles in a selected station.
- Register and log in with the backend user API.
- Start and end rental trips through the backend trip API.
- Calculate trip cost with the current pricing rule:
  - First 5 minutes: 7,000 VND
  - Each extra minute: 1,000 VND
- Track trip summary information:
  - User details
  - Vehicle details
  - Start and end station
  - Distance
  - Duration
  - Battery before trip
  - Battery used
  - Battery after trip
  - Price breakdown
- Check whether a vehicle has enough battery for an estimated route.

## Setup

### Prerequisites

- Python 3.12+ recommended
- Node.js 20+ recommended
- npm

### Backend Setup

```powershell
cd backend
python -m pip install -r requirements.txt
```

By default, the backend uses SQLite:

```text
sqlite:///./grab_future.db
```

You can override the database with:

```powershell
$env:DATABASE_URL="your-database-url"
```

### Frontend Setup

```powershell
cd frontend
npm install
```

Create or update `frontend/.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Run

### Run Backend

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API docs:

```text
http://127.0.0.1:8000/docs
```

### Run Frontend

```powershell
cd frontend
npm.cmd run dev
```

Frontend app:

```text
http://127.0.0.1:4028
```

### Run With Docker

```powershell
cd backend
docker compose up --build
```

## User Guide

1. Open the frontend app.
2. Click the user icon in the top bar.
3. Register a new account or log in with an existing account.
4. View stations on the map.
5. Select a departure station.
6. Optionally choose a destination station from visible station estimates.
7. Continue to the vehicle selection screen.
8. Select an available vehicle.
9. Start the rental trip.
10. During the trip, view live trip stats on the active trip screen.
11. End the trip and confirm the return station.
12. Review the trip summary and price breakdown.

## Tech Stack

### Backend

- FastAPI
- SQLAlchemy
- Pydantic
- SQLite by default
- PostgreSQL-compatible via `DATABASE_URL`
- Uvicorn

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React icons

### Tooling

- Docker
- Docker Compose
- npm scripts
- FastAPI Swagger docs

## Main API Endpoints

### Users

- `POST /users/register`
- `POST /users/login`
- `GET /users/{user_id}`
- `PUT /users/{user_id}`

### Stations

- `GET /stations/`
- `POST /stations/`
- `GET /stations/{station_id}`
- `PUT /stations/{station_id}`
- `DELETE /stations/{station_id}`
- `GET /stations/{station_id}/vehicles`

### Vehicles

- `GET /vehicles/`
- `POST /vehicles/`
- `GET /vehicles/{vehicle_id}`
- `PUT /vehicles/{vehicle_id}`
- `PUT /vehicles/{vehicle_id}/status`

### Trips

- `POST /trips/start`
- `POST /trips/{trip_id}/end`
- `GET /trips/`
- `GET /trips/{trip_id}`
- `GET /trips/users/{user_id}`

