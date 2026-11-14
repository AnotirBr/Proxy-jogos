const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();

app.use(cors());

// IDs oficiais na API-Football (v3) para os campeonatos escolhidos:
const LIGAS_PRIORITARIAS = [
  13,  // CONMEBOL Libertadores
  11,  // CONMEBOL Sul-Americana
  73,  // Copa do Brasil
  2,   // UEFA Champions League
  39,  // Premier League (Inglaterra)
  140, // La Liga (Espanhol)
  135, // Serie A (Italiano)
  // Seleções (Copa do Mundo, Euro, Nations League, Copa América, Amistosos e Eliminatórias):
  1, 4, 5, 9, 10, 29, 30, 31, 32, 33, 34, 37, 960
];

function formatarJogos(lista) {
  return lista.map((item) => {
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
}

app.get('/', (req, res) => {
  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  const options = {
    hostname: 'v3.football.api-sports.io',
    path: `/fixtures?date=${hoje}&timezone=America/Sao_Paulo`,
    method: 'GET',
    headers: {
      'x-apisports-key': '1da11c52117664f574b848e1a431542e',
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

        // Filtra os campeonatos desejados; se não houver nenhum hoje, pega os primeiros 30 do dia
        const jogosFiltrados = lista.filter((item) =>
          LIGAS_PRIORITARIAS.includes(item.league.id)
        );
        const listaFinal = jogosFiltrados.length > 0 ? jogosFiltrados : lista.slice(0, 30);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(formatarJogos(listaFinal));
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
