from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, DateTime, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os

# Configuration de la base de données
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/atelier_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modèle de données
class CountTable(Base):
    __tablename__ = "count_table"
    
    id = Column(Integer, primary_key=True, index=True)
    count_number = Column(Integer, default=0)

class CountHistory(Base):
    __tablename__ = "count_history"
    
    id = Column(Integer, primary_key=True, index=True)
    count_value = Column(Integer)
    action = Column(String)  # 'increment' ou 'reset'
    timestamp = Column(DateTime, default=datetime.utcnow)

# Créer les tables
Base.metadata.create_all(bind=engine)

# Modèles Pydantic
class CountResponse(BaseModel):
    count: int

class CountIncrementResponse(BaseModel):
    count: int
    message: str

class CountHistoryItem(BaseModel):
    id: int
    count_value: int
    action: str
    timestamp: datetime

class CountHistoryResponse(BaseModel):
    history: list[CountHistoryItem]

# Application FastAPI
app = FastAPI(title="Atelier FastAPI", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autoriser toutes origines en LAN (simple pour démo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dépendance pour obtenir la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Atelier FastAPI - Backend pour l'IA générative"}

@app.get("/count", response_model=CountResponse)
async def get_count(db: Session = Depends(get_db)):
    """Récupère la valeur actuelle du compteur"""
    count_record = db.query(CountTable).first()
    if not count_record:
        # Créer un enregistrement initial si aucun n'existe
        count_record = CountTable(count_number=0)
        db.add(count_record)
        db.commit()
        db.refresh(count_record)
    
    return CountResponse(count=count_record.count_number)

@app.post("/count/increment", response_model=CountIncrementResponse)
async def increment_count(db: Session = Depends(get_db)):
    """Incrémente le compteur de 1"""
    count_record = db.query(CountTable).first()
    if not count_record:
        # Créer un enregistrement initial si aucun n'existe
        count_record = CountTable(count_number=0)
        db.add(count_record)
        db.commit()
        db.refresh(count_record)
    
    count_record.count_number += 1
    db.commit()
    db.refresh(count_record)
    
    # Enregistrer dans l'historique
    history_record = CountHistory(
        count_value=count_record.count_number,
        action="increment"
    )
    db.add(history_record)
    db.commit()
    
    return CountIncrementResponse(
        count=count_record.count_number,
        message="Compteur incrémenté avec succès"
    )

@app.post("/count/reset", response_model=CountResponse)
async def reset_count(db: Session = Depends(get_db)):
    """Réinitialise le compteur à 0"""
    count_record = db.query(CountTable).first()
    if not count_record:
        # Créer un enregistrement initial si aucun n'existe
        count_record = CountTable(count_number=0)
        db.add(count_record)
    else:
        count_record.count_number = 0
    
    db.commit()
    db.refresh(count_record)
    
    # Enregistrer dans l'historique
    history_record = CountHistory(
        count_value=count_record.count_number,
        action="reset"
    )
    db.add(history_record)
    db.commit()
    
    return CountResponse(count=count_record.count_number)

@app.get("/count/history", response_model=CountHistoryResponse)
async def get_count_history(db: Session = Depends(get_db)):
    """Récupère l'historique des actions sur le compteur"""
    history_records = db.query(CountHistory).order_by(CountHistory.timestamp.desc()).all()
    
    history_items = [
        CountHistoryItem(
            id=record.id,
            count_value=record.count_value,
            action=record.action,
            timestamp=record.timestamp
        )
        for record in history_records
    ]
    
    return CountHistoryResponse(history=history_items)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
