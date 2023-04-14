import re
import json
import string

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.sentiment.vader import SentimentIntensityAnalyzer


# Initialize the sentiment analyzer
nltk.download("vader_lexicon")
sia = SentimentIntensityAnalyzer()


def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()

    # Remove punctuations
    text = re.sub("[%s]" % re.escape(string.punctuation), "", text)

    # Remove stopwords
    stop_words = set(stopwords.words("english"))
    tokens = word_tokenize(text)
    text = [word for word in tokens if not word in stop_words]
    text = " ".join(text)

    return text


def score_pressure(email):
    body = email.body.text
    # Analyze the sentiment of the email body
    text = preprocess_text(body)
    sentiment = sia.polarity_scores(text)

    # Check if the compound score is negative
    if sentiment["compound"] < 0:
        return 100

    # Check if the email contains words associated with scams / pressure
    scam_words = [
        "buy",
        "limited",
        "exclusive",
        "act",
        "new",
        "amazing",
        "never",
        "instant",
        "best",
        "miss",
        "hurry",
        "today",
        "now",
        "save",
        "deal",
        "offer",
        "free",
        "bonus",
        "gift",
        "discount",
        "special",
        "win",
        "cash",
        "guarantee",
        "proven",
        "tested",
        "results",
        "easy",
        "simple",
        "quick",
        "fast",
        "success",
        "popular",
        "trending",
        "famous",
        "trusted",
        "reliable",
        "recommended",
        "top",
        "bestseller",
        "rated",
        "luxury",
        "premium",
        "exclusive",
        "elite",
        "private",
        "personalized",
        "tailored",
        "customized",
        "handcrafted",
        "unique",
        "original",
        "one-of-a-kind",
        "limited edition",
        "rare",
        "collectible",
        "vintage",
        "classic",
        "timeless",
        "modern",
        "trendy",
        "fashionable",
        "stylish",
        "sleek",
        "cool",
        "hip",
        "chic",
        "edgy",
        "bold",
        "vibrant",
        "colorful",
        "bright",
        "fun",
        "playful",
        "whimsical",
        "romantic",
        "nostalgic",
        "dreamy",
        "inspirational",
        "motivational",
        "uplifting",
        "empowering",
        "transformative",
        "life-changing",
        "mind-blowing",
        "game-changing",
        "breakthrough",
        "revolutionary",
        "innovative",
        "cutting-edge",
        "advanced",
        "next-level",
        "state-of-the-art",
        "high-tech",
        "smart",
        "intelligent",
        "sophisticated",
        "powerful",
        "efficient",
        "effective",
        "reliable",
        "user-friendly",
        "easy-to-use",
        "convenient",
        "comfortable",
        "luxurious",
        "pampering",
        "relaxing",
        "soothing",
        "calming",
        "refreshing",
        "invigorating",
        "energizing",
        "healthy",
        "natural",
        "organic",
        "wholesome",
        "nutritious",
        "delicious",
        "mouth-watering",
        "yummy",
        "satisfying",
        "filling",
        "indulgent",
        "decadent",
        "hearty",
        "home-style",
        "authentic",
        "exotic",
        "international",
        "global",
        "cosmopolitan",
        "cultured",
        "sophisticated",
        "classy",
        "elegant",
        "graceful",
        "beautiful",
        "gorgeous",
        "stunning",
        "captivating",
        "mesmerizing",
        "enchanting",
        "magical",
        "fascinating",
        "intriguing",
        "mysterious",
        "surprising",
        "unexpected",
        "amusing",
        "entertaining",
        "funny",
        "hilarious",
        "witty",
        "clever",
        "smart",
        "insightful",
        "thought-provoking",
        "educational",
        "informative",
        "enlightening",
        "eye-opening",
        "mind-expanding",
        "inspiring",
        "motivating",
        "encouraging",
        "uplifting",
        "life-affirming",
        "life-enhancing",
        "life-changing",
        "heart-warming",
        "heartfelt",
        "emotional",
        "touching",
        "moving",
        "powerful",
        "meaningful",
        "profound",
        "deep",
        "intense",
        "passionate",
        "romantic",
        "sexy",
        "sensual",
        "erotic",
        "naughty",
        "kinky",
        "taboo",
        "exciting",
    ]
    count = 0
    for word in scam_words:
        count += text.lower().count(word)

    # Calculate the score based on the number of scam words found
    return min(0.15 * count, 1)
