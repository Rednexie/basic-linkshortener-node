const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const port = 3000;

const sqlite = new Database('links.sqlite');

sqlite.prepare(`
CREATE TABLE IF NOT EXISTS links(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    short TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`).run();

function select(link) {
  return sqlite.prepare('SELECT * FROM links WHERE short = ?').get(link);
}

function insert(url, link) {
  sqlite.prepare('INSERT INTO links(url, short) VALUES(?, ?)').run(url, link);
}

app.get('/', (req, res) => {
  res.send('Hello from Node.js <3!');
});

app.get('/links', (req, res) => {
  const links = sqlite.prepare('SELECT * FROM links').all();
  res.json(links);
});

app.get('/links/new', (req, res) => {
  const url = req.query.url;
  let link = req.query.link;

  if (!url) {
    return res.status(400).send('Missing url');
  }
  if (!link) {
    link = Math.random().toString(36).substring(2, 8);
  }

  insert(url, link);
  res.send(`${req.protocol}://${req.get('host')}/${link}`);
});

app.get('/:short', (req, res) => {
  const { short } = req.params;
  const row = select(short);

  if (row) {
    return res.redirect(row.url);
  }

  res.status(404).send('Link not found');
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

