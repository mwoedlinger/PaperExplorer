import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs
from typing import Optional, Dict, Tuple
from datetime import datetime, timedelta
import json
import argparse

def get_arxiv_info(arxiv_link: str) -> Optional[Dict[str, str]]:
    """Fetches the title, authors, abstract and publication date of a paper from arXiv

    Args:
        arxiv_link (str): URL of the arXiv paper

    Returns:
        Optional[Dict[str, str]]: A dictionary containing the title, authors, abstract and publication date of the paper
    """
    parsed_url = urlparse(arxiv_link)
    arxiv_id = parse_qs(parsed_url.query).get('id', [parsed_url.path.split('/')[-1]])[0]
    api_url = f"https://export.arxiv.org/api/query?id_list={arxiv_id}"

    try:
        with requests.get(api_url) as response:
            if response.ok:
                soup = BeautifulSoup(response.text, "xml")
                entry = soup.find('entry')
                categories = [category['term'] for category in entry.find_all('category')]
                date_time = entry.find('published').text.strip()
                return {
                    "title": entry.find('title').text.strip(),
                    "authors": [author.text.strip() for author in entry.find_all('name')],
                    "abstract": entry.find('summary').text.strip(),
                    "publication_date": date_time.split('T')[0],
                    "publication_time": date_time.split('T')[1].split('Z')[0],
                    "tags": categories,
                }
            else:
                print(f"Error: Unable to fetch data from arXiv API, status code {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

    return None

def get_date(soup: BeautifulSoup) -> Tuple[int, int]:
    """Extracts the date from the page"""
    month_to_num = {month: index for index, month in enumerate(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                                                                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'], 1)}
    date_parts = soup.find('time').find_all('span')
    return month_to_num[date_parts[0].text.lower()], int(date_parts[1].text)

def get_articles(url: str, min_upvotes: Optional[int] = None) -> Dict[str, Dict]:
    collection = {}

    with requests.get(url) as response:
        if not response.ok:
            print(f"Error fetching URL: {url}, status code: {response.status_code}")
            return collection

        soup = BeautifulSoup(response.text, 'html.parser')
        if (int(url.split('-')[-2]), int(url.split('-')[-1])) != get_date(soup):
            print('Date does not match URL. Skipped!')
            return collection

        for article in soup.find_all('article'):
            primary_link = article.find_all(lambda tag: tag.name == 'a' and tag.get('class') == ['cursor-pointer'])
            if len(primary_link) == 0:
                primary_link = article.find('a', href=True)
            else:
                primary_link = primary_link[0]
            if not primary_link:
                print('No link found')
                continue

            arxiv_id = primary_link['href'].split('/')[-1]
            arxiv_link = f'https://arxiv.org/abs/{arxiv_id}'

            # New upvotes extraction
            upvotes_div = article.find('div', class_='shadow-alternate')
            upvotes = upvotes_div.find('div', class_='leading-none')
            upvotes = int(upvotes.text) if upvotes and upvotes.text.isdigit() else 0

            if min_upvotes and (upvotes is None or upvotes < min_upvotes):
                continue

            arxiv_info = get_arxiv_info(arxiv_link)
            if arxiv_info:
                collection[arxiv_id] = {'url': arxiv_link, **arxiv_info, 'upvotes': upvotes}

    return collection

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--start_date', type=str, help='Start date in YYYY-MM-DD format. Example 2024-02-05')
    parser.add_argument('--end_date', type=str, help='End date in YYYY-MM-DD format. Example 2024-02-15')
    args = parser.parse_args()


    if args.start_date:      
        start_date = datetime.strptime(args.start_date, '%Y-%m-%d').date()
    else: # check papers.json for the last date and start from the next day
        try:
            with open("papers.json", "r") as fp:
                articles = json.load(fp)
            start_date = datetime.strptime(max(articles.values(), key=lambda x: x['publication_date'])['publication_date'], '%Y-%m-%d').date() + timedelta(days=1)
            print(f'Starting from {start_date}')
        except FileNotFoundError:
            start_date = datetime.now().date()
            print('No existing data found. Starting from today')

    if args.end_date:
        end_date = datetime.strptime(args.end_date, '%Y-%m-%d').date()
    else:
        end_date = datetime.now().date()
    print(f'Start date: {start_date}, End date: {end_date}')

    current_date = start_date
    base_url = 'https://huggingface.co/papers?date='
    articles = {}
    while current_date <= end_date: 
        print(f'Processing {current_date}')
        
        url = base_url + str(current_date)
        articles.update(get_articles(url))
        
        current_date += timedelta(days=1)
        
    # Read papers.json as dict if it exists
    try:
        with open("papers.json", "r") as fp:
            old_articles = json.load(fp)
    except FileNotFoundError:
        old_articles = {}

    # remove duplicates
    articles = {k: v for k, v in articles.items() if k not in old_articles}
    print(f'Found {len(articles)} new articles')
    if articles:
        # update the file with new articles
        old_articles.update(articles)
        with open("papers.json", "w") as fp:
            json.dump(old_articles, fp, indent=4)