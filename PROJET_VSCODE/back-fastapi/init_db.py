#!/usr/bin/env python3
"""
Script d'initialisation de la base de données
Crée la table et insère un enregistrement initial avec count = 0
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.count_table import CountTable, Base

def init_database():
    """Initialise la base de données avec la table count_table"""
    
    # Configuration de la base de données
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/atelier_db")
    
    try:
        # Créer l'engine et la session
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Créer toutes les tables
        Base.metadata.create_all(bind=engine)
        print("✅ Tables créées avec succès")
        
        # Créer une session pour insérer les données initiales
        db = SessionLocal()
        
        # Vérifier si un enregistrement existe déjà
        existing_count = db.query(CountTable).first()
        
        if not existing_count:
            # Créer un enregistrement initial avec count = 0
            initial_count = CountTable(count_number=0)
            db.add(initial_count)
            db.commit()
            print("✅ Enregistrement initial créé avec count = 0")
        else:
            print(f"ℹ️  Enregistrement existant trouvé avec count = {existing_count.count_number}")
        
        db.close()
        print("✅ Base de données initialisée avec succès")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la base de données: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
