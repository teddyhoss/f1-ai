#!/usr/bin/env python3
"""
Launcher script per il server
Risolve problemi di import path
"""
import sys
import os
from pathlib import Path

# Aggiungi backend directory al Python path
backend_dir = Path(__file__).parent.absolute()
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Ora importa e avvia l'app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
