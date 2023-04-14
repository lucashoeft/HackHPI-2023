from datetime import datetime
from typing import NamedTuple

import html2text


class Entity(NamedTuple):
    email_address: str
    display_name: str
    recipient_type: str


def datetime_from_string(date_string: str):
    date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
    return datetime.strptime(date_string, date_format)


class HtmlBody:
    def __init__(self, html_content: str):
        self.html_content = html_content

    @property
    def html(self):
        return self.html_content

    @property
    def text(self):
        converter = html2text.HTML2Text()
        converter.ignore_links = True
        converter.ignore_images = True
        plain_text = converter.handle(self.html_content)
        return plain_text


class Email(NamedTuple):
    subject: str
    from_: Entity
    to: list[Entity]
    cc: list[Entity]
    date_time_created: datetime
    data_time_modified: datetime
    body: HtmlBody
