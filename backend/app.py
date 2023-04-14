from flask import Flask, jsonify, request
from flask_cors import CORS

from model import Email, Entity, HtmlBody, datetime_from_string

from checks.grammar import score_grammar
from checks.sender import score_sender

import concurrent.futures


app = Flask(__name__)
CORS(app)


def check(email: Email) -> dict[str, float]:
    """Checks the email using the checks in checks/ and returns a dictionary"""
    # with concurrent.futures.ThreadPoolExecutor() as executor:
    #     tasks = [
    #         executor.submit(score_grammar, email),
    #         executor.submit(score_sender, email),
    #     ]

    #     for future in concurrent.futures.as_completed(tasks):
    #         result = future.result()
    #         print(result)
            
    grammar_score = score_grammar(email)
    sender_score = score_sender(email)

    return {
        "overall": 0,
        "grammar": grammar_score,
        "links": 0,
        "pressure": 0,
        "sender": sender_score,
    }


@app.route("/", methods=["GET", "POST"])
def api_check():
    data = request.get_json()

    email = Email(
        subject=data["subject"],
        from_=Entity(*data["from"].values()),
        to=[Entity(*d.values()) for d in data["to"]],
        cc=[Entity(*d.values()) for d in data["cc"]],
        date_time_created=datetime_from_string(data["dateTimeCreated"]),
        data_time_modified=datetime_from_string(data["dateTimeModified"]),
        body=HtmlBody(data["body"]),
    )

    return jsonify(check(email))


if __name__ == "__main__":
    app.run(debug=True)
