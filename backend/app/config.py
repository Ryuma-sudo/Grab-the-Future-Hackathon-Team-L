import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Lấy DATABASE_URL từ biến môi trường, fallback sang SQLite nếu không có
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./grab_future.db"  # fallback cho dev/test
)

# Nếu dùng SQLite thì cần check_same_thread, còn Postgres/Neon thì không
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Tạo engine kết nối DB
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal để quản lý session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base để khai báo model
Base = declarative_base()

# Dependency cho FastAPI (dùng trong router)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
