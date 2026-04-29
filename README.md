# The House of WA — Blockchain Legal Appointment System

Academic project for the *Implementing Blockchain Technologies* course  
MSc in Digital Business and Innovation — Tokyo International University, 2024

---

## Overview

The House of WA is a simulation of a blockchain applied to legal consultation booking. The idea was to explore whether blockchain concepts make sense outside of cryptocurrency — in this case, using it to record appointment requests as immutable blocks instead of storing them in a regular database.

The system runs two Flask servers in parallel: one serves the web interface (port 5000), the other acts as the blockchain node (port 8000). When a client submits a form, the web app sends the data as a transaction to the node, which then mines it into a confirmed block automatically.

This is strictly for academic and demonstration purposes. No real legal services, no real data persistence.

---

## How it works

1. Client fills the form: name, email, phone, legal department, and a short message
2. The web app (`views.py`) posts the data to `/new_transaction` on the node
3. Immediately after, it calls `/mine` — the node runs Proof of Work
4. PoW works by incrementing a nonce until the SHA-256 hash of the block starts with `00` (difficulty = 2)
5. Once a valid hash is found, the block is appended to the chain
6. The web app fetches the full chain from `/chain` and displays confirmed appointments in a table

Each block stores: index, timestamp, the transaction data, hash of the previous block, and the nonce. Changing any field in a confirmed block breaks the hash chain from that point forward.

---

## Project structure

```
attourney/
├── node_server.py         # Block and Blockchain classes + Flask API (port 8000)
├── run_app.py             # web app entry point (port 5000)
└── app/
    ├── __init__.py
    ├── views.py           # routes: form submit, auto-mine, chain fetch and display
    └── templates/
        ├── base.html
        └── index.html
    └── Static/
        ├── CSS/styles.css
        └── JS/main.js
```

---

## Running the project

Requirements: Python 3, Flask, requests

```bash
pip install flask requests
```

Open two terminals:

**Terminal 1 — blockchain node:**
```bash
python node_server.py --port 8000
```

**Terminal 2 — web app:**
```bash
python run_app.py
# runs on http://127.0.0.1:5000
```

Open `http://127.0.0.1:5000` in your browser, fill the form and submit. The appointment gets mined into a block automatically and appears in the records table below.

---

## Node API endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/new_transaction` | POST | add appointment data to the pending pool |
| `/mine` | GET | run PoW and mine pending transactions into a block |
| `/chain` | GET | return the full blockchain as JSON |
| `/pending_tx` | GET | return unconfirmed transactions |
| `/register_node` | POST | register a peer node |
| `/register_with` | POST | join an existing node and sync the chain |
| `/add_block` | POST | verify and add a block mined by a peer |

---

## Limitations

This is a demo built for learning purposes, so a few things are intentionally kept simple:

- The chain is not saved to disk, restarting the node clears everything
- There is no user authentication
- The peer-to-peer sync was not tested across multiple machines

---

## Possible extensions

- Persist the chain to a JSON file or SQLite on each new block
- Add difficulty adjustment
- Role-based access for an admin to review blockchain records


---

*Hamza Ejjbiri — Tokyo International University, 2024*
