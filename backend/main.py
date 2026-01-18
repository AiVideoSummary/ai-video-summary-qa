from fastapi import FastAPI
from app.infrastructure.database import engine
from app.domain import models

# Bu satır sihirli satırdır: models.py'deki her şeyi veritabanına aktarır
models.Base.metadata.create_all(bind=engine)

# Uygulama nesnesini oluşturuyoruz
app = FastAPI(title="NoteGenie API")

@app.get("/")
def read_root():
    return {"message": "NoteGenie Backend Çalışıyor!"}