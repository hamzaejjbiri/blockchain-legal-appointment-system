import datetime
import json
import requests
from flask import render_template, redirect, request

from app import app

CONNECTED_NODE_ADDRESS = "http://127.0.0.1:8000"
posts = []


def fetch_posts():
    """
    Fetch the chain from a blockchain node, parse the data and store it locally.
    """
    get_chain_address = "{}/chain".format(CONNECTED_NODE_ADDRESS)
    response = requests.get(get_chain_address)

    if response.status_code == 200:
        content = []
        chain = json.loads(response.content)

        for block in chain["chain"]:
            for tx in block["transactions"]:
                tx["index"] = block["index"]
                tx["hash"] = block["previous_hash"]
                content.append(tx)

        global posts
        posts = sorted(content, key=lambda k: k.get("timestamp", 0), reverse=True)


@app.route("/")
def index():
    fetch_posts()
    return render_template(
        "index.html",
        title="The House of WA",
        posts=posts,
        node_address=CONNECTED_NODE_ADDRESS,
        readable_time=timestamp_to_string,
    )


@app.route("/error")
def error_function():
    return render_template("error.html")


@app.route('/submit', methods=['POST'])
def submit_textarea():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    phone = request.form.get("phone", "").strip()
    department = request.form.get("department", "").strip()
    message = request.form.get("message", "").strip()

    # Basic checks
    if not name or not email or "@" not in email or not phone or not department or not message:
        return redirect('/')

    post_object = {
        "name": name,
        "email": email,
        "phone": phone,
        "department": department,
        "message": message,
    }

    # 1) Send transaction to blockchain node
    new_tx_address = f"{CONNECTED_NODE_ADDRESS}/new_transaction"
    tx_res = requests.post(
        new_tx_address,
        json=post_object,
        headers={'Content-Type': 'application/json'}
    )

    # If tx failed, go back (optional: redirect to /error)
    if tx_res.status_code not in (200, 201):
        return redirect('/error')

    # 2) AUTO-MINE right after submitting transaction
    mine_address = f"{CONNECTED_NODE_ADDRESS}/mine"
    requests.get(mine_address)

    return redirect('/')



def timestamp_to_string(epoch_time):
    return datetime.datetime.fromtimestamp(epoch_time).strftime("%Y-%m-%d %H:%M")
