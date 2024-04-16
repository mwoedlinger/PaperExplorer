# ML Paper Explorer

I created this small repo to make it easier to stay up-to-date with research in ML. It uses the paper recommendations posted (almost) daily on huggingface.co/papers (Thanks a lot to AK) and stores all of the them in papers.json. A simple web interface allows searching in all recommended papers, sorting them by upvotes (from huggingface) or date. You can also select papers by arxiv tag by clicking on the tags below the author list.

Try it out [mlpapers.netlify.app](mlpapers.netlify.app).

## Features

- Web interface for keyword search within the paper titles, abstracts, tags and authors.
- Sort papers by publication date or number of upvotes.
- Define a date range with start and end date
- Select arxiv tags or authors by clicking on them
- Combine search queries with a semicolon
- The paper list gets updated daily and upvotes get updated every sunday (see branch "uptodate")

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

You can manually update the papers.json file with `update_papers.py`
```bash
python update_papers.py --start_date YYYY-MM-DD
```
which updates the `papers.json` file with all papers posted since `YYYY-MM-DD` (you can also specify an end date with `--end_date` if you are only interested in papers between two specific dates). This might take a moment (took me around 5 seconds per day).

Updating the upvotes only can be done with `update_votes.py`.


