"""
Seed Neon PostgreSQL database with stations and vehicles
matching the frontend mock data (mockData.ts).

Run from backend/ directory:
    python seed.py
"""

import os
import sys
from pathlib import Path

# Load .env
_env = Path(__file__).parent / ".env"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

from app.config import Base, SessionLocal, engine
from app.models.station import Station
from app.models.vehicle import Vehicle, VehicleStatus

# ── Stations — mirrors MOCK_STATIONS in frontend/src/lib/mockData.ts ──────────
STATIONS = [
    # id will be 1-10 (auto-increment)
    dict(name="Ga Metro Đại Học Quốc Gia",      address="Xa Lộ Hà Nội, Linh Trung, Thủ Đức, TP.HCM",                   latitude=10.8712, longitude=106.8054, capacity=10),
    dict(name="Trạm ĐH Khoa học Tự nhiên",       address="Cổng chính HCMUS, Linh Trung, Thủ Đức, TP.HCM",                latitude=10.8696, longitude=106.8030, capacity=8),
    dict(name="Trạm ĐH Quốc Tế",                address="Khu phố 6, Linh Trung, Thủ Đức, TP.HCM",                      latitude=10.8674, longitude=106.8012, capacity=8),
    dict(name="Trạm ĐH Bách Khoa (CS2)",         address="Tô Vĩnh Diện, Linh Chiểu, Thủ Đức, TP.HCM",                  latitude=10.8803, longitude=106.8000, capacity=6),
    dict(name="Trạm KTX Khu A, ĐHQG",            address="Khu A Ký Túc Xá ĐHQG-HCM, Linh Trung, Thủ Đức",             latitude=10.8718, longitude=106.7992, capacity=10),
    dict(name="Trạm Cổng Chính ĐHQG",            address="Cổng chính ĐHQG-HCM, Linh Trung, Thủ Đức, TP.HCM",           latitude=10.8681, longitude=106.8021, capacity=6),
    dict(name="Trạm Khu Công Nghệ Cao TP.HCM",   address="Đường D1, Khu CNC, Linh Trung, Thủ Đức, TP.HCM",             latitude=10.8521, longitude=106.8162, capacity=8),
    dict(name="Trạm Bến Xe Suối Tiên",           address="Xa lộ Hà Nội, Tăng Nhơn Phú B, Thủ Đức, TP.HCM",            latitude=10.8945, longitude=106.8240, capacity=7),
    dict(name="Trạm Tam Bình - Thủ Đức",         address="Ngã tư Bình Triệu, Tam Bình, Thủ Đức, TP.HCM",               latitude=10.8350, longitude=106.7560, capacity=9),
    dict(name="Trạm Bến Xe Miền Đông (mới)",     address="Đường Hoàng Hữu Nam, Long Bình, Thủ Đức, TP.HCM",            latitude=10.7960, longitude=106.8021, capacity=6),
]

# ── Vehicles — mirrors MOCK_VEHICLES in frontend/src/lib/mockData.ts ──────────
# Format: (station_index_1based, code, battery, range_km, status)
# code becomes the display name: shown as-is in the UI
VEHICLES = [
    # Station 1 — Ga Metro ĐHQG (6 ready + 4 non-ready = 10)
    (1, "Yadea G5 · A1",       87,  52, "ready"),
    (1, "Yadea G5 · A2",       64,  38, "ready"),
    (1, "Yadea C1S · B1",      45,  27, "ready"),
    (1, "Yadea EM10 Pro · B2",  8,   4, "ready"),      # very low battery — greys out for long trips
    (1, "Yadea T9 Pro · C1",   92,  55, "ready"),
    (1, "Yadea C1S · C2",      76,  46, "ready"),
    (1, "Yadea G5 · D1",       32,  19, "charging"),
    (1, "Yadea C1S · D2",      15,   9, "charging"),
    (1, "Yadea T9 Pro · D3",    0,   0, "maintenance"),
    (1, "Yadea EM10 Pro · D4", 55,  33, "rented"),

    # Station 2 — ĐH Khoa học Tự nhiên (4 ready + 4)
    (2, "Yadea T9 Pro · A1",   72,  43, "ready"),
    (2, "Yadea G5 · A2",       55,  33, "ready"),
    (2, "Yadea C1S · B1",      88,  53, "ready"),
    (2, "Yadea EM10 Pro · B2", 41,  25, "ready"),
    (2, "Yadea G5 · C1",       20,  12, "charging"),
    (2, "Yadea C1S · C2",      60,  36, "rented"),
    (2, "Yadea T9 Pro · D1",   45,  27, "rented"),
    (2, "Yadea EM10 Pro · D2",  5,   3, "maintenance"),

    # Station 3 — ĐH Quốc Tế (5 ready + 3)
    (3, "Yadea G5 · A1",       91,  55, "ready"),
    (3, "Yadea G5 · A2",       67,  40, "ready"),
    (3, "Yadea C1S · B1",      54,  32, "ready"),
    (3, "Yadea T9 Pro · B2",   79,  47, "ready"),
    (3, "Yadea EM10 Pro · C1", 35,  21, "ready"),
    (3, "Yadea G5 · C2",       10,   6, "charging"),
    (3, "Yadea C1S · D1",      72,  43, "rented"),
    (3, "Yadea T9 Pro · D2",   48,  29, "rented"),

    # Station 4 — ĐH Bách Khoa CS2 (0 ready — all occupied/charging)
    (4, "Yadea G5 · A1",       30,  18, "charging"),
    (4, "Yadea G5 · A2",       80,  48, "rented"),
    (4, "Yadea C1S · B1",      55,  33, "rented"),
    (4, "Yadea T9 Pro · B2",   90,  54, "rented"),
    (4, "Yadea EM10 Pro · C1",  0,   0, "maintenance"),
    (4, "Yadea C1S · C2",      12,   7, "charging"),

    # Station 5 — KTX Khu A (7 ready + 3)
    (5, "Yadea G5 · A1",       95,  57, "ready"),
    (5, "Yadea G5 · A2",       82,  49, "ready"),
    (5, "Yadea C1S · A3",      71,  43, "ready"),
    (5, "Yadea T9 Pro · B1",   58,  35, "ready"),
    (5, "Yadea EM10 Pro · B2", 43,  26, "ready"),
    (5, "Yadea C1S · B3",      88,  53, "ready"),
    (5, "Yadea G5 · C1",       66,  40, "ready"),
    (5, "Yadea T9 Pro · C2",   25,  15, "charging"),
    (5, "Yadea EM10 Pro · C3", 18,  11, "charging"),
    (5, "Yadea G5 · D1",       90,  54, "rented"),

    # Station 6 — Cổng Chính ĐHQG (2 ready + 4)
    (6, "Yadea T9 Pro · A1",   74,  44, "ready"),
    (6, "Yadea C1S · A2",      49,  29, "ready"),
    (6, "Yadea G5 · B1",       35,  21, "charging"),
    (6, "Yadea EM10 Pro · B2", 60,  36, "rented"),
    (6, "Yadea C1S · B3",      80,  48, "rented"),
    (6, "Yadea T9 Pro · C1",   55,  33, "rented"),

    # Station 7 — Khu CNC TP.HCM (5 ready + 3)
    (7, "Yadea G5 · A1",       93,  56, "ready"),
    (7, "Yadea G5 · A2",       78,  47, "ready"),
    (7, "Yadea C1S · B1",      61,  37, "ready"),
    (7, "Yadea T9 Pro · B2",   44,  26, "ready"),
    (7, "Yadea EM10 Pro · C1", 85,  51, "ready"),
    (7, "Yadea G5 · C2",       22,  13, "charging"),
    (7, "Yadea C1S · D1",      68,  41, "rented"),
    (7, "Yadea T9 Pro · D2",   50,  30, "rented"),

    # Station 8 — Bến Xe Suối Tiên (4 ready + 3)
    (8, "Yadea T9 Pro · A1",   89,  53, "ready"),
    (8, "Yadea G5 · A2",       70,  42, "ready"),
    (8, "Yadea C1S · B1",      52,  31, "ready"),
    (8, "Yadea EM10 Pro · B2", 36,  22, "ready"),
    (8, "Yadea G5 · C1",       14,   8, "charging"),
    (8, "Yadea C1S · C2",      80,  48, "rented"),
    (8, "Yadea T9 Pro · D1",   63,  38, "rented"),

    # Station 9 — Tam Bình Thủ Đức (6 ready + 3)
    (9, "Yadea G5 · A1",       96,  58, "ready"),
    (9, "Yadea G5 · A2",       83,  50, "ready"),
    (9, "Yadea T9 Pro · A3",   65,  39, "ready"),
    (9, "Yadea C1S · B1",      48,  29, "ready"),
    (9, "Yadea EM10 Pro · B2", 77,  46, "ready"),
    (9, "Yadea G5 · B3",       58,  35, "ready"),
    (9, "Yadea C1S · C1",      28,  17, "charging"),
    (9, "Yadea T9 Pro · C2",   72,  43, "rented"),
    (9, "Yadea EM10 Pro · D1", 40,  24, "rented"),

    # Station 10 — Bến Xe Miền Đông mới (3 ready + 3)
    (10, "Yadea G5 · A1",       88,  53, "ready"),
    (10, "Yadea T9 Pro · A2",   73,  44, "ready"),
    (10, "Yadea C1S · B1",      59,  35, "ready"),
    (10, "Yadea EM10 Pro · B2", 17,  10, "charging"),
    (10, "Yadea G5 · C1",       91,  55, "rented"),
    (10, "Yadea C1S · C2",      64,  38, "rented"),
]

STATUS_MAP = {
    "ready":       VehicleStatus.READY,
    "charging":    VehicleStatus.CHARGING,
    "maintenance": VehicleStatus.MAINTENANCE,
    "rented":      VehicleStatus.RENTED,
}

def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Station).count() > 0:
            print(f"DB already has {db.query(Station).count()} stations — skipping seed.")
            print("To re-seed: DELETE FROM vehicles; DELETE FROM stations; then run again.")
            return

        print("Inserting stations...")
        station_objs = []
        for s in STATIONS:
            obj = Station(**s)
            db.add(obj)
            station_objs.append(obj)
        db.flush()  # get auto-increment IDs

        print("Inserting vehicles...")
        for station_idx, code, battery, range_km, status_str in VEHICLES:
            station_obj = station_objs[station_idx - 1]
            db.add(Vehicle(
                code=code,
                station_id=station_obj.id,
                battery_level=float(battery),
                estimated_range_km=float(range_km),
                status=STATUS_MAP[status_str],
            ))

        db.commit()
        print(f"✓ Seeded {len(STATIONS)} stations and {len(VEHICLES)} vehicles.")

    except Exception as e:
        db.rollback()
        print(f"✗ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
