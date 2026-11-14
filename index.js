const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  // Calcula a data de hoje automaticamente no fuso de Brasília
  const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    .toISOString()
    .split("T")[0];

  const options = {
    hostname: 'v3.football.api-sports.io',
    path: `/fixtures?date=${hoje}&timezone=America/Sao_Paulo`,
    method: 'GET',
    headers: {
      'x-apisports-key': 'SUA_CHAVE_API_FOOTBALL_AQUI',
      'Accept': 'application/json'
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.status(apiRes.statusCode).send(data);
    });
  });

  apiReq.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  apiReq.end();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));
