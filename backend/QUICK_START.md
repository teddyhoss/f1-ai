# Quick Start - Backend F1 AI Game

## Avvio Rapido

### Metodo 1: Script Automatico (Raccomandato)

Dalla directory root del progetto:

```bash
./start.sh
```

### Metodo 2: Manuale

```bash
cd backend
source venv/bin/activate  # Se hai già creato il venv
# oppure: python3 -m venv venv && source venv/bin/activate

pip install -r requirements.txt
python run.py
```

## Verifica Funzionamento

Apri browser: **http://localhost:8000/docs**

Oppure:

```bash
curl http://localhost:8000/api/health
```

Risposta attesa:
```json
{
  "status": "ok",
  "active_games": 0,
  "blockchain_height": 1
}
```

## Test Completo

In un altro terminale:

```bash
cd backend
source venv/bin/activate
python test_game.py
```

## Troubleshooting

### Import Error

Se vedi `ImportError: attempted relative import beyond top-level package`:
- Assicurati di usare `python run.py` (non `python main.py`)
- Il file `run.py` gestisce correttamente i path di import

### Port 8000 già in uso

```bash
lsof -ti:8000 | xargs kill -9
```

### Venv non attivato

```bash
source venv/bin/activate
```

Dovresti vedere `(venv)` nel prompt.

## Prossimi Passi

- Leggi [README.md](README.md) per documentazione completa API
- Vedi [../FRONTEND_GUIDE.md](../FRONTEND_GUIDE.md) per integrare frontend
- Controlla [../API_EXAMPLES.md](../API_EXAMPLES.md) per esempi chiamate

**Buon sviluppo!** 🚀
