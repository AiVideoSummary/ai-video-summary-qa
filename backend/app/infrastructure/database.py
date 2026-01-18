import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# .env dosyasındaki çevresel değişkenleri yükle
load_dotenv()

# Bilgileri .env dosyasından çekiyoruz. 
# Eğer .env dosyası bulunamazsa veya içi boşsa hata almamak için varsayılan bir değer de tanımlayabilirsin.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Eğer .env dosyan doğru yapılandırılmışsa, 
# URL artık senin yerel bilgilerini (postgres:123456 vb.) içerecek.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()