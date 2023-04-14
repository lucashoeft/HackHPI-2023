from flask import Flask, jsonify, request
from flask_cors import CORS

from model import Email, Entity, HtmlBody, datetime_from_string

from checks.grammar import score_grammar
from checks.sender import score_sender


app = Flask(__name__)
CORS(app)

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


if __name__ == "__main__":
    app.run(debug=True)
