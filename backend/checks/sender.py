import re


def score_sender(email) -> float:
    display_name = email.from_.display_name
    email_address = email.from_.email_address
    
    overall_score = 0
    
    email_name = re.match(r"([^@]+)@", email_address)
    email_name = email_name.group(1).lower() # it has to be valid email address

    # Split the email based on delimiters (e.g., ".", "-", "_", " ")
    words_in_address = re.split(
        r"[._\-]+", re.match(r"([^@]+)@", email_address.lower()).group(1)
    )
    words_in_display_name = re.split(r"[._\- ]+", display_name.lower())

    for name_word in words_in_display_name:
        for address_word in words_in_address:
            if name_word in address_word:
                overall_score += 1
            if address_word in name_word:
                overall_score += 1

    # List of suspicious keywords or patterns
    suspicious_keywords = [
        r"\d+",  # Numbers
        r'[!@#$%^&*(),.?":{}|<>]',  # Special characters
        "lotto", "xxx", # other suspicious keywords
    ]
    # Check for suspicious keywords or patterns in the display name
    for keyword in suspicious_keywords:
        if re.search(keyword, display_name.lower()):
            overall_score -= 4
            
    return 1 - max(1/overall_score, 0)


