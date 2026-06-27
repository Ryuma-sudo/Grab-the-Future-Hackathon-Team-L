"""
Seed script — run once to populate Neon with demo data.
Usage:  python seed.py
"""

from app.config import Base, SessionLocal, engine
from app.models import station, user, vehicle  # noqa: F401 — registers models
from app.models.station import Station
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus
from app.utils.auth import hash_password

# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------

STATIONS = [
    # ── Metro Line 1 ────────────────────────────────────────────────────────
    {"name": "Bến Thành",       "address": "Vòng xoay Quách Thị Trang, Q.1",            "lat": 10.7720, "lng": 106.6986},
    {"name": "Nhà hát Thành phố","address": "Lam Sơn, Bến Nghé, Q.1",                   "lat": 10.7769, "lng": 106.7030},
    {"name": "Ba Son",           "address": "Tôn Đức Thắng, Q.1",                        "lat": 10.7887, "lng": 106.7056},
    {"name": "Văn Thánh",        "address": "Điện Biên Phủ, Bình Thạnh",                 "lat": 10.7973, "lng": 106.7118},
    {"name": "Tân Cảng",         "address": "Nguyễn Hữu Cảnh, Bình Thạnh",              "lat": 10.8022, "lng": 106.7224},
    {"name": "Thảo Điền",        "address": "Xa lộ Hà Nội, Thảo Điền, TP.Thủ Đức",     "lat": 10.8070, "lng": 106.7350},
    {"name": "An Phú",           "address": "Xa lộ Hà Nội, An Phú, TP.Thủ Đức",         "lat": 10.8018, "lng": 106.7481},
    {"name": "Rạch Chiếc",       "address": "Xa lộ Hà Nội, An Phú, TP.Thủ Đức",         "lat": 10.8139, "lng": 106.7578},
    {"name": "Phước Long",       "address": "Xa lộ Hà Nội, Phước Long B, TP.Thủ Đức",   "lat": 10.8197, "lng": 106.7652},
    {"name": "Bình Thái",        "address": "Xa lộ Hà Nội, Bình Thọ, TP.Thủ Đức",       "lat": 10.8274, "lng": 106.7741},
    {"name": "Thủ Đức",          "address": "Xa lộ Hà Nội, Trường Thọ, TP.Thủ Đức",     "lat": 10.8509, "lng": 106.7724},
    {"name": "Khu Công nghệ cao","address": "Xa lộ Hà Nội, Long Thạnh Mỹ, TP.Thủ Đức", "lat": 10.8614, "lng": 106.7971},
    {"name": "Đại học Quốc gia", "address": "Xa lộ Hà Nội, Linh Trung, TP.Thủ Đức",    "lat": 10.8698, "lng": 106.8031},
    {"name": "Suối Tiên",        "address": "Xa lộ Hà Nội, Long Bình, TP.Thủ Đức",      "lat": 10.8756, "lng": 106.8175},
    # ── Universities — VNU Village ──────────────────────────────────────────
    {"name": "HCMUT (Bách Khoa)","address": "Khu phố 6, Linh Trung, TP.Thủ Đức",        "lat": 10.8803, "lng": 106.8052},
    {"name": "UEL (Kinh tế – Luật)","address": "Khu phố 6, Linh Trung, TP.Thủ Đức",    "lat": 10.8758, "lng": 106.8036},
    {"name": "UIT (CNTT)",       "address": "Khu phố 6, Linh Trung, TP.Thủ Đức",        "lat": 10.8697, "lng": 106.8030},
    {"name": "IU (Quốc tế)",     "address": "Khu phố 6, Linh Trung, TP.Thủ Đức",        "lat": 10.8756, "lng": 106.8058},
    {"name": "HCMUS (KHTN)",     "address": "Khu phố 6, Linh Trung, TP.Thủ Đức",        "lat": 10.8800, "lng": 106.8057},
    {"name": "Med-VNU",          "address": "Khu phố 6, Linh Trung, TP.Thủ Đức",        "lat": 10.8748, "lng": 106.8055},
]

DEMO_USER = {
    "full_name": "Demo User",
    "email": "demo@grab-future.vn",
    "phone": "0900000001",
    "password": "demo1234",
}

VEHICLES_PER_STATION = 4


# ---------------------------------------------------------------------------
# Seed
# ---------------------------------------------------------------------------

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Station).count() > 0:
            print("Stations already exist — skipping seed.")
            return

        # Stations
        station_objs = []
        for s in STATIONS:
            obj = Station(
                name=s["name"],
                address=s["address"],
                latitude=s["lat"],
                longitude=s["lng"],
                capacity=VEHICLES_PER_STATION,
                is_active=True,
            )
            db.add(obj)
            station_objs.append(obj)
        db.flush()  # get IDs

        # Vehicles — 4 per station
        vehicle_counter = 1
        for st in station_objs:
            for i in range(1, VEHICLES_PER_STATION + 1):
                db.add(Vehicle(
                    code=f"EM{vehicle_counter:04d}",
                    station_id=st.id,
                    battery_level=round(70 + (vehicle_counter % 3) * 10, 1),  # 70/80/90 %
                    estimated_range_km=45.0,
                    status=VehicleStatus.READY,
                ))
                vehicle_counter += 1

        # Demo user
        if not db.query(User).filter(User.email == DEMO_USER["email"]).first():
            db.add(User(
                full_name=DEMO_USER["full_name"],
                email=DEMO_USER["email"],
                phone=DEMO_USER["phone"],
                hashed_password=hash_password(DEMO_USER["password"]),
            ))

        db.commit()
        print(f"Seeded {len(station_objs)} stations, {vehicle_counter - 1} vehicles, 1 demo user.")
        print(f"  Demo login — email: {DEMO_USER['email']}  password: {DEMO_USER['password']}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
