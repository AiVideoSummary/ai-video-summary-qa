from fastapi import FastAPI

# Uygulama nesnesini oluşturuyoruz
app = FastAPI(title="NoteGenie API")

@app.get("/")
def read_root():
    return {"message": "NoteGenie Backend Çalışıyor!"}