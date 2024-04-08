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
                return {
                    "title": entry.find('title').text.strip(),
                    "authors": [author.text.strip() for author in entry.find_all('name')],
                    "abstract": entry.find('summary').text.strip(),
                    "publication_date": entry.find('published').text.strip()
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
    """Fetches the articles from the given URL

    Args:
        url (str): URL of the huggingface papers page
        min_upvotes (Optional[int], optional): Minimum number of upvotes required. Defaults to None.

    Returns:
        Dict[str, Dict]: _description_
    """
    collection = {}

    with requests.get(url) as response:
        if not response.ok:
            print(f"Error fetching URL: {url}, status code: {response.status_code}")
            return collection

        soup = BeautifulSoup(response.text, 'html.parser')
        # Check if the date in the URL matches the date on the page
        # This is important because on dates where no papers are published, the page will show the latest valid date
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
            upvotes = article.find('div', class_='leading-none')
            upvotes = int(upvotes.text) if upvotes and upvotes.text.isdigit() else None

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

    start_date = datetime.strptime(args.start_date, '%Y-%m-%d').date()
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
        
    # Read papers.json as dict:
    with open("papers.json", "r") as fp:
        old_articles = json.load(fp)

    # update the file with new articles
    articles.update(articles)
    with open("papers.json", "w") as fp:
        json.dump(articles, fp, indent=4)