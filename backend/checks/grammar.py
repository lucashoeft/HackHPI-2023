import language_tool_python


def score_grammar(email) -> float:
    body = email.body.text

    tool = language_tool_python.LanguageTool("en-US")  # TODO: add other languages

    matches = tool.check(body)
    num_errors = len(matches)
    num_words = len(body.split())
    grammar_score = (num_words - num_errors) / num_words

    return grammar_score
