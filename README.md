# huggingface-papers-scrapper

I created this small repo to make it easier to stay up-to-date with research in ML. It uses the paper recommendations posted (almost) daily on huggingface.co/paper (Thanks a lot to AK) and stores all of the them in papers.json. A simple web interface allows searching in all recommended papers, sorting them by upvotes (from huggingface) or date. You can also select papers by arxiv tag by clicking on the tags below the author list.

Try it out [here](https://htmlpreview.github.io/?https://github.com/mwoedlinger/huggingface-papers-scrapper/blob/main/index.html).

## Features

- Web interface for keyword search within the paper titles, abstracts, tags and authors.
- Sort papers by publication date or number of upvotes.
- Define a date range with start and end date
- Select arxiv tags or authors by clicking on them
- Combine search queries with a semicolon

## How-to run locally

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