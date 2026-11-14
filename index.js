const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  const options = {
    hostname: 'v3.football.api-sports.io',
    path: '/fixtures?live=all',
    method: 'GET',
    headers: {
      'x-apisports-key': '00397071439f1c71b5eeeccab11ffb0c',
      'Accept': 'application/json'
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const lista = json.response || [];

        // Se houver jogos ao vivo, formata e entrega para o app
        if (lista.length > 0) {
          const jogosFormatados = lista.map((item) => ({
            time1: item.teams.home.name,
            time2: item.teams.away.name,
            escudo1: item.teams.home.logo,
            escudo2: item.teams.away.logo,
            horario: "AO VIVO",
            campeonato: item.league.name,
            placar: `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`,
            status: item.fixture.status.short,
            canal: ""
          }));
          res.setHeader('Content-Type', 'application/json');
          return res.status(200).json(jogosFormatados);
        }

        // Se vier vazio, mostra o motivo exato retornado pela API-Football
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(json);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  });

  apiReq.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  apiReq.end();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));
