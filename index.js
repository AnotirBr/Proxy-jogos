const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  // Calcula a data de hoje e de daqui a 3 dias para garantir que sempre tenha jogos na lista
  const hoje = new Date();
  const futuro = new Date();
  futuro.setDate(hoje.getDate() + 3);

  const dateFrom = hoje.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const dateTo = futuro.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  const options = {
    hostname: 'api.football-data.org',
    path: `/v4/matches?competitions=PL,ELC,BL1,SA,PD,FL1,DED,PPL,BSA,CL,EC,WC&dateFrom=${dateFrom}&dateTo=${dateTo}`,
    method: 'GET',
    headers: {
      'X-Auth-Token': '1da11c52117664f574b848e1a431542e',
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
      try {
        const json = JSON.parse(data);
        const lista = json.matches || [];

        // Traduz para o formato exato que o seu aplicativo entende
        const jogosFormatados = lista.map((item) => {
          const dataJogo = new Date(item.utcDate);
          const horario = dataJogo.toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
          });

          const golsCasa = item.score?.fullTime?.home;
          const golsFora = item.score?.fullTime?.away;
          const placar = (golsCasa !== null && golsFora !== null) ? `${golsCasa} - ${golsFora}` : '';

          return {
            time1: item.homeTeam.shortName || item.homeTeam.name,
            time2: item.awayTeam.shortName || item.awayTeam.name,
            escudo1: item.homeTeam.crest,
            escudo2: item.awayTeam.crest,
            horario: horario,
            campeonato: item.competition.name,
            placar: placar,
            status: item.status,
            canal: ""
          };
        });

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(jogosFormatados);
      } catch (e) {
        res.status(500).json({ error: "Erro ao processar resposta", detalhe: e.message });
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
