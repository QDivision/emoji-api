const express = require('express');
const pgp = require('pg-promise')();

let db = undefined;
const initDb = async () => {
  if (db) return db;

  db = pgp({
    host: 'localhost',
    port: 5002,
    database: 'emojidb',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS emojis (
      label TEXT NOT NULL PRIMARY KEY,
      emoji TEXT NOT NULL
    )
  `);

  return db;
};

const PORT = 4002;
const app = express();

app.use(express.json());

app.get('/emojis/:label', async (req, res) => {
  const { label } = req.params;

  const db = await initDb();
  const emojis = await db.query(
    `SELECT * FROM emojis WHERE label = $<label> LIMIT 1`,
    { label },
  );

  res.status(200).json(emojis[0]).end();
});

app.post('/emojis/:label', async (req, res) => {
  const { body } = req;
  const { label } = req.params;

  console.log(`Creating emoji '${label}' with value: ${body.emoji}`);

  const db = await initDb();
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
