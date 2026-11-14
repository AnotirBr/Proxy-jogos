const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  const options = {
    hostname: 'api.football-data.org',
    path: '/v4/matches?competitions=PL,ELC,BL1,SA,PD,FL1,DED,PPL,BSA,CL,EC,WC&status=SCHEDULED,TIMED,IN_PLAY,PAUSED',
    method: 'GET',
    headers: {
      'X-Auth-Token': 'cbbe39e454b54abb988f1cd41778bbd0',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FootballProxy/1.0',
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
