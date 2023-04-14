from flask import Flask, jsonify, request
from flask_cors import CORS

from model import Email

from checks.grammar import score_grammar
from checks.sender import score_sender
from checks.links import score_links
from checks.attachments import score_attachments
from checks.pressure import score_pressure

from chatbot.ask import ask

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print(data)
    messages = data['messages']
    
    return jsonify({ "msg": ask(messages) })

@app.route("/check_grammar", methods=["POST"])
def grammar_check():
    data = request.get_json()
    email = Email.from_data(data)

    return jsonify(score_grammar(email))

@app.route("/check_sender", methods=["POST"])
def sender_check():
    data = request.get_json()
    email = Email.from_data(data)

    return jsonify(score_sender(email))

@app.route("/check_links", methods=["POST"])
def links_check():
    data = request.get_json()
    email = Email.from_data(data)

    return jsonify(score_links(email))

@app.route("/check_attachments", methods=["POST"])
def attachments_check():
    data = request.get_json()
    email = Email.from_data(data)

    return jsonify(score_attachments(email))

@app.route("/check_pressure", methods=["POST"])
def pressure_check():
    data = request.get_json()
    email = Email.from_data(data)

    return jsonify(score_pressure(email))

if __name__ == "__main__":
    app.run(debug=True)
