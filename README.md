# huggingface-papers-scrapper

This project extracts recommended scientific papers from huggingface.co/papers, stores them in a JSON file, and provides a web interface for searching and sorting the papers by publication date and the number of upvotes. It should help staying up-to-date with research in ML. Thanks a lot to AK for posting the papers.

## Features

- Fetch and parse scientific papers recommended on huggingface.co/papers.
- Store paper details in a structured JSON file.
- Web interface for keyword search within the paper titles, abstracts, and authors.
- Sort papers by publication date or number of upvotes.

## How-to

Clone the repository:
```bash
git clone https://github.com/yourusername/scientific-paper-recommender.git
```

Search papers with the web interface:
```bash
python -m http.server
```
open a browser and go to `http://localhost:8000` to see the web interface.

The papers.json file contains papers until `2024-04-08`, if you want more recent papers you need to update the file with
```bash
python extract.py --start_date 2024-04-09
```
(you can also specify an end date with `--end_date` if you are only interested in papers between two specific dates).
This might take a few minutes (took me around 5 second per date).