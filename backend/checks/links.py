from bs4 import BeautifulSoup
from urllib.parse import urlparse
from tld import get_tld

def score_links(email):
    soup = BeautifulSoup(email.body.html, 'lxml')

    urls = []
    topDomains = []
    topDomains2 = []
    texts = []
    schemes = []

    for link in soup.find_all('p'):
        print(link)

    for link in soup.find_all('a'):

        link_text = link.string

        link_href = link.get('href')
        
        # link_href2 = link_href.replace('\'', '"')  

        o = urlparse(link_href)
        top_level_domain = o.netloc.split('.')[-1].split(':')[0]
        top_level_domain2 = get_tld(link_href, fail_silently=True)

        # print(o.netloc)

        schemes.append(o.scheme)
        urls.append(link_href)
        topDomains.append(top_level_domain)
        topDomains2.append(top_level_domain2)
        texts.append(link_text)

    # print(urls)
    # print(topDomains)
    # print(topDomains2)
    # print(texts)
    # print(schemes)

    if 'de' in topDomains:
        return 0
    else:
        return 0.9
