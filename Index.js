const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  const TOKEN = "cbbe39e454b54abb988f1cd41778bbd0";
  const API_URL = "https://football-data.org";

  try {
    const response = await fetch(API_URL, {
      headers: {
        "X-Auth-Token": TOKEN,
        "Accept": "application/json"
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
