const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  const options = {
    hostname: 'v3.football.api-sports.io',
    path: `/fixtures?date=${hoje}&timezone=America/Sao_Paulo`,
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

        // Transforma os dados da API para o formato limpo que o aplicativo entende
        const jogosFormatados = lista.map((item) => {
          const dataJogo = new Date(item.fixture.date);
          const horario = dataJogo.toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit'
          });

          const golsCasa = item.goals.home !== null ? item.goals.home : '';
          const golsFora = item.goals.away !== null ? item.goals.away : '';
          const placar = (golsCasa !== '' && golsFora !== '') ? `${golsCasa} - ${golsFora}` : '';

          return {
            time1: item.teams.home.name,
            time2: item.teams.away.name,
            escudo1: item.teams.home.logo,
            escudo2: item.teams.away.logo,
            horario: horario,
            campeonato: item.league.name,
            placar: placar,
            status: item.fixture.status.short,
            canal: ""
          };
        });

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(jogosFormatados);
      } catch (e) {
        res.status(500).json({ error: "Erro ao formatar jogos", detalhe: e.message });
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
