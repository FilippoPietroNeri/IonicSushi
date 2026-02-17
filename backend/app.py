from flask import Flask, request, jsonify
from DatabaseWrapper import DatabaseWrapper

app = Flask(__name__)

db = DatabaseWrapper()

@app.route("/menu", methods=["GET"])
def menu():
    return jsonify(db.get_menu())

@app.route("/ordine", methods=["POST"])
def crea_ordine():
    data = request.json
    ordine_id = db.crea_ordine(
        data["codice_tavolo"],
        data["nome_cliente"],
        data["prodotti"]
    )
    return jsonify({"ordine_id": ordine_id})

@app.route("/ordini/<codice_tavolo>", methods=["GET"])
def ordini_tavolo(codice_tavolo):
    return jsonify(db.get_ordini_by_tavolo(codice_tavolo))

@app.route("/ordine/<int:ordine_id>/stato", methods=["PUT"])
def aggiorna_stato(ordine_id):
    stato = request.json["stato"]
    db.aggiorna_stato_ordine(ordine_id, stato)
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)
