"""Local HTTP checks. Start the app on loopback with no genealogy credentials."""
import json
import os
from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.error import HTTPError

BASE = os.environ.get('GENEALOGY_TEST_URL', 'http://127.0.0.1:3115')
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.jsonld = []
        self.record = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('a', 'link'):
            self.links.append(attrs)
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.record = True
    def handle_endtag(self, tag):
        if tag == 'script':
            self.record = False
    def handle_data(self, data):
        if self.record:
            self.jsonld.append(json.loads(data))
def get(path):
    try:
        with urlopen(BASE + path) as response:
            return response.status, response.read().decode()
    except HTTPError as error:
        return error.code, error.read().decode()
checked = 0
for locale in ('ru', 'kk'):
    status, html = get(f'/{locale}/shezhire-tree')
    assert status == 200
    assert 'genealogy_not_configured' not in html
    assert ('Источник недоступен' if locale == 'ru' else 'Дереккөз қолжетімсіз') in html
    page = Page()
    page.feed(html)
    assert any(link.get('rel') == 'canonical' and link['href'] == f'https://skezire.kz/{locale}/shezhire-tree' for link in page.links)
    assert len([link for link in page.links if 'hreflang' in link]) == 3
    urls = {link['href'] for link in page.links if link.get('href', '').startswith(f'/{locale}/encyclopedia/')}
    assert len(urls) == 51
    for url in urls:
        status, content = get(url)
        assert status == 200, url
        parsed = Page()
        parsed.feed(content)
        assert any(link.get('rel') == 'canonical' and link['href'] == f'https://skezire.kz{url}' for link in parsed.links), url
        parts = url.strip('/').split('/')
        focus = parts[-1] if len(parts) == 4 else 'zhuz:' + parts[-1]
        map_url = f'/{locale}/shezhire-tree?highlight={focus}'
        assert any(link.get('href') == map_url for link in parsed.links), url
        checked += 1
    status, content = get(f'/{locale}/shezhire-tree?highlight=naiman')
    assert status == 200
    parsed = Page()
    parsed.feed(content)
    assert any(link.get('rel') == 'canonical' and link['href'] == f'https://skezire.kz/{locale}/shezhire-tree' for link in parsed.links)
    status, content = get(f'/api/genealogy/search?source=repo&locale={locale}&q=%D0%90%D0%B4%D0%B0%D0%B9')
    assert status == 200 and json.loads(content)['results'][0]['id'] == 'tribe:aday'
assert get('/api/genealogy/children?source=repo&node=missing')[0] == 404
assert get('/api/genealogy/children?source=repo&node=alash&offset=-1')[0] == 400
assert '/_next/' not in get('/robots.txt')[1]
sitemap = get('/sitemap.xml')[1]
for locale in ('ru', 'kk'):
    assert f'https://skezire.kz/{locale}/shezhire-tree' in sitemap
assert '?highlight=' not in sitemap
print(f'PASS: unavailable-source UI, RU/KK canonical/hreflang/JSON-LD, {checked} encyclopedia URLs with canonical and exact map links, query canonical, repo search, API errors, robots and sitemap. Full DB not connected.')
