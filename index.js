const express = require('express');
const pgp = require('pg-promise')();

const db = pgp({
  host: 'localhost',
  port: 5002,
  database: 'emojidb',
  user: 'admin',
  password: 'admin',
});

db.query(`
  CREATE TABLE IF NOT EXISTS emojis (
    label TEXT NOT NULL PRIMARY KEY,
    emoji TEXT NOT NULL
  )
`);

const PORT = 4002;
const app = express();

app.use(express.json());

app.get('/emojis/:label', async (req, res) => {
  const { label } = req.params;

  const emojis = await db.query(
    `SELECT * FROM emojis WHERE label = $<label> LIMIT 1`,
    { label },
  );

  res.status(200).json(emojis[0]).end();
});

app.post('/emojis/:label', async (req, res) => {
  const { body } = req;
  const { label } = req.params;

  await db.query(
    `INSERT INTO emojis (label, emoji) VALUES ($<label>, $<emoji>) 
     ON CONFLICT (label) DO UPDATE SET emoji=$<emoji>`,
    { label, emoji: body.emoji },
  );

  res.status(200).json().end();
});

app.listen(PORT, () => {
  console.log(`emoji-api listening on port ${PORT}`);
});
