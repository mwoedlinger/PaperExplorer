# Huggingface Papers Viewer

I created this small repo to make it easier to stay up-to-date with research in ML. It uses the paper recommendations posted (almost) daily on huggingface.co/papers (Thanks a lot to AK) and stores all of the them in papers.json. A simple web interface allows searching in all recommended papers, sorting them by upvotes (from huggingface) or date. You can also select papers by arxiv tag by clicking on the tags below the author list.

Try it out [here](https://htmlpreview.github.io/?https://github.com/mwoedlinger/HuggingfacePapersViewer/blob/uptodate/index.html).

## Features

- Web interface for keyword search within the paper titles, abstracts, tags and authors.
- Sort papers by publication date or number of upvotes.
- Define a date range with start and end date
- Select arxiv tags or authors by clicking on them
- Combine search queries with a semicolon

## How-to run locally

Clone the repository and install the requirements:
```bash
git clone https://github.com/mwoedlinger/HuggingfacePapersViewer.git
cd HuggingfacePapersViewer
pip install -r requirements.txt
```

Search papers with the web interface:
```bash
python -m http.server
```
open a browser and go to `http://localhost:8000` to see the web interface.

The papers.json file in the repository gets updated daily, if you clone it and want more recent papers you need to update the file with
```bash
python extract.py --start_date YYYY-MM-DD
```
which updates the `papers.json` file with all papers posted since `YYYY-MM-DD` (you can also specify an end date with `--end_date` if you are only interested in papers between two specific dates). This might take a moment (took me around 5 seconds per day).
