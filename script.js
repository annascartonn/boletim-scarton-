// Configuração fixa do estudante para autenticação e conexão com a API
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 2,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Dados fictícios padronizados locais do 9º Ano (backup caso a API não tenha dados)
const materiasLocais = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Frequência geral apenas fictícia/demonstrativa para esta versão
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Variáveis de estado da sessão em memória
let pinSessao = "";
let dadosAtuais = [];

// Variáveis de controle dos gráficos (instâncias do Chart.js)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// Função para normalizar notas antigas/brutas na escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === 'string') {
    valor = valor.replace(',', '.');
  }

  let num = Number(valor);

  if (isNaN(num)) {
    return null;
  }

  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  if (num >= 0 && num <= 10) {
    return Math.round(num * 10) / 10;
  }

  return null;
}

// Retorna a classe CSS de cor para a nota individual
function getClasseNota(nota) {
  if (nota === null) return "nota-ausente";
  if (nota >= 9.0) return "nota-excelente"; // Verde vivo
  if (nota >= 6.0) return "nota-boa";       // Amarelo vibrante
  return "nota-atencao";                    // Vermelho
}

// Renderiza a tabela e atualiza os cards no modo visualização
function renderizarBoletim(disciplinas) {
  const corpoTabela = document.getElementById('corpo-tabela');
  corpoTabela.innerHTML = '';

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  disciplinas.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const notasValidas = [n1, n2, n3].filter(n => n !== null);
    let media = null;
    let situacaoTexto = "Nota ainda não disponível";
    let situacaoClasse = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      media = Math.round((soma / notasValidas.length) * 10) / 10;

      somaMediasGerais += media;
      qtdDisciplinasComMedia++;

      if (media >= 6.0) {
        situacaoTexto = "Bom desempenho";
        situacaoClasse = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacaoTexto = "Atenção";
        situacaoClasse = "situacao-atencao";
        qtdAtencao++;
      }
    }

    let totalFaltasDisc = 0;
    if (Array.isArray(item.faltas)) {
      totalFaltasDisc = item.faltas.reduce((acc, curr) => acc + Number(curr || 0), 0);
    }

    totalFaltasGeral += totalFaltasDisc;

    const txt1 = n1 !== null ? n1.toFixed(1).replace('.', ',') : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace('.', ',') : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace('.', ',') : "—";
    const txtMedia = media !== null ? media.toFixed(1).replace('.', ',') : "—";

    const tr = document.createElement('tr');

    const tdNome = document.createElement('td');
    const strongNome = document.createElement('strong');
    strongNome.textContent = item.disciplina;
    tdNome.appendChild(strongNome);

    const tdN1 = document.createElement('td');
    tdN1.className = getClasseNota(n1);
    tdN1.textContent = txt1;

    const tdN2 = document.createElement('td');
    tdN2.className = getClasseNota(n2);
    tdN2.textContent = txt2;

    const tdN3 = document.createElement('td');
    tdN3.className = getClasseNota(n3);
    tdN3.textContent = txt3;

    const tdMedia = document.createElement('td');
    tdMedia.className = getClasseNota(media);
    const strongMedia = document.createElement('strong');
    strongMedia.textContent = txtMedia;
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement('td');
    tdFaltas.textContent = totalFaltasDisc;

    const tdSituacao = document.createElement('td');
    const spanSituacao = document.createElement('span');
    spanSituacao.className = situacaoClasse;
    spanSituacao.textContent = situacaoTexto;
    tdSituacao.appendChild(spanSituacao);

    tr.appendChild(tdNome);
    tr.appendChild(tdN1);
    tr.appendChild(tdN2);
    tr.appendChild(tdN3);
    tr.appendChild(tdMedia);
    tr.appendChild(tdFaltas);
    tr.appendChild(tdSituacao);

    corpoTabela.appendChild(tr);
  });

  const mediaGeralFinal = qtdDisciplinasComMedia > 0 
    ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace('.', ',') 
    : "—";

  document.getElementById('card-media').textContent = mediaGeralFinal;
  document.getElementById('card-faltas').textContent = totalFaltasGeral;
  document.getElementById('card-bom-desempenho').textContent = qtdBomDesempenho;
  document.getElementById('card-atencao').textContent = qtdAtencao;

  // Atualização estritamente de leitura dos gráficos
  atualizarGraficos();
}

// Conecta à API para abrir o boletim
async function autenticarEAbrir() {
  const campoPin = document.getElementById('campo-pin');
  const msgLogin = document.getElementById('msg-login');
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Digite seu PIN.";
    msgLogin.className = "mensagem-status msg-erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status msg-info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status msg-erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status msg-erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status msg-erro";
      return;
    }

    const resultado = await resposta.json();
    pinSessao = pinDigitado;
    campoPin.value = "";

    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      dadosAtuais = resultado.dados.disciplinas;
    } else {
      dadosAtuais = materiasLocais;
    }

    document.getElementById('secao-login').style.display = 'none';
    document.getElementById('conteudo-boletim').style.display = 'block';

    renderizarBoletim(dadosAtuais);

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status msg-erro";
  }
}

// Constrói a tabela de edição
function abrirEdicao() {
  const corpoEdicao = document.getElementById('corpo-tabela-edicao');
  corpoEdicao.innerHTML = '';
  document.getElementById('msg-salvar').textContent = '';

  dadosAtuais.forEach((item, idx) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const f1 = Array.isArray(item.faltas) ? (item.faltas[0] !== undefined ? item.faltas[0] : 0) : 0;
    const f2 = Array.isArray(item.faltas) ? (item.faltas[1] !== undefined ? item.faltas[1] : 0) : 0;
    const f3 = Array.isArray(item.faltas) ? (item.faltas[2] !== undefined ? item.faltas[2] : 0) : 0;

    const tr = document.createElement('tr');

    const tdNome = document.createElement('td');
    const strongNome = document.createElement('strong');
    strongNome.textContent = item.disciplina;
    tdNome.appendChild(strongNome);

    tr.appendChild(tdNome);

    tr.appendChild(criarTdInput(`n1_${idx}`, n1 !== null ? String(n1).replace('.', ',') : ""));
    tr.appendChild(criarTdInput(`n2_${idx}`, n2 !== null ? String(n2).replace('.', ',') : ""));
    tr.appendChild(criarTdInput(`n3_${idx}`, n3 !== null ? String(n3).replace('.', ',') : ""));

    tr.appendChild(criarTdInput(`f1_${idx}`, f1, true));
    tr.appendChild(criarTdInput(`f2_${idx}`, f2, true));
    tr.appendChild(criarTdInput(`f3_${idx}`, f3, true));

    corpoEdicao.appendChild(tr);
  });

  document.getElementById('secao-tabela-visualizacao').style.display = 'none';
  document.getElementById('secao-edicao').style.display = 'block';
}

function criarTdInput(id, valor, isFalta = false) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = "text";
  input.id = id;
  input.value = valor !== null && valor !== undefined ? valor : "";
  if (isFalta) input.placeholder = "0";
  else input.placeholder = "—";
  td.appendChild(input);
  return td;
}

// Validação de notas para digitação: 0 a 10 ou vazio
function validarNotaDigitada(valStr) {
  const str = valStr.trim();
  if (str === "") return { valido: true, valor: null };

  const normalizada = str.replace(',', '.');
  const num = Number(normalizada);

  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: Math.round(num * 10) / 10 };
}

// Validação de faltas: inteiro >= 0
function validarFaltaDigitada(valStr) {
  const str = valStr.trim();
  if (str === "") return { valido: false, valor: null };

  const num = Number(str);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: num };
}

// Salva as alterações na API
async function salvarAlteracoes() {
  const msgSalvar = document.getElementById('msg-salvar');
  msgSalvar.textContent = "";

  let temErro = false;
  const novasDisciplinas = [];

  dadosAtuais.forEach((item, idx) => {
    const inputN1 = document.getElementById(`n1_${idx}`);
    const inputN2 = document.getElementById(`n2_${idx}`);
    const inputN3 = document.getElementById(`n3_${idx}`);

    const inputF1 = document.getElementById(`f1_${idx}`);
    const inputF2 = document.getElementById(`f2_${idx}`);
    const inputF3 = document.getElementById(`f3_${idx}`);

    [inputN1, inputN2, inputN3, inputF1, inputF2, inputF3].forEach(inp => inp.classList.remove('campo-invalido'));

    const vN1 = validarNotaDigitada(inputN1.value);
    if (!vN1.valido) { inputN1.classList.add('campo-invalido'); temErro = true; }

    const vN2 = validarNotaDigitada(inputN2.value);
    if (!vN2.valido) { inputN2.classList.add('campo-invalido'); temErro = true; }

    const vN3 = validarNotaDigitada(inputN3.value);
    if (!vN3.valido) { inputN3.classList.add('campo-invalido'); temErro = true; }

    const vF1 = validarFaltaDigitada(inputF1.value);
    if (!vF1.valido) { inputF1.classList.add('campo-invalido'); temErro = true; }

    const vF2 = validarFaltaDigitada(inputF2.value);
    if (!vF2.valido) { inputF2.classList.add('campo-invalido'); temErro = true; }

    const vF3 = validarFaltaDigitada(inputF3.value);
    if (!vF3.valido) { inputF3.classList.add('campo-invalido'); temErro = true; }

    novasDisciplinas.push({
      disciplina: item.disciplina,
      tri1: vN1.valor,
      tri2: vN2.valor,
      tri3: vN3.valor,
      faltas: [vF1.valor, vF2.valor, vF3.valor]
    });
  });

  if (temErro) {
    msgSalvar.textContent = "Verifique os campos destacados em vermelho. Digite notas entre 0 e 10 e faltas como números inteiros.";
    msgSalvar.className = "mensagem-status msg-erro";
    return;
  }

  msgSalvar.textContent = "Salvando...";
  msgSalvar.className = "mensagem-status msg-info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgSalvar.textContent = "Erro ao salvar alterações no servidor. Tente novamente.";
      msgSalvar.className = "mensagem-status msg-erro";
      return;
    }

    dadosAtuais = novasDisciplinas;
    renderizarBoletim(dadosAtuais);

    document.getElementById('secao-edicao').style.display = 'none';
    document.getElementById('secao-tabela-visualizacao').style.display = 'block';

    msgSalvar.textContent = "Dados salvos com sucesso.";
    msgSalvar.className = "mensagem-status msg-sucesso";

  } catch (erro) {
    msgSalvar.textContent = "Falha de conexão ao salvar os dados. Tente novamente.";
    msgSalvar.className = "mensagem-status msg-erro";
  }
}

function cancelarEdicao() {
  document.getElementById('secao-edicao').style.display = 'none';
  document.getElementById('secao-tabela-visualizacao').style.display = 'block';
}

// --- FUNÇÕES EXCLUSIVAS PARA OS GRÁFICOS (SOMENTE LEITURA) ---

function atualizarGraficoMedias() {
  const canvas = document.getElementById('graficoMediasDisciplinas');
  if (!canvas) return;

  const labels = [];
  const valores = [];

  dadosAtuais.forEach(item => {
    labels.push(item.disciplina);
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const validas = [n1, n2, n3].filter(n => n !== null);
    if (validas.length > 0) {
      const soma = validas.reduce((a, b) => a + b, 0);
      valores.push(Math.round((soma / validas.length) * 10) / 10);
    } else {
      valores.push(null);
    }
  });

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  graficoMedias = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Média Atual',
        data: valores,
        backgroundColor: '#ffcc00',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#ffffff', font: { size: 10 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const v = context.raw;
              if (v === null) return 'Média: —';
              return 'Média: ' + String(v).replace('.', ',');
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById('graficoEvolucaoTrimestres');
  if (!canvas) return;

  const somas = [0, 0, 0];
  const qtds = [0, 0, 0];

  dadosAtuais.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    if (n1 !== null) { somas[0] += n1; qtds[0]++; }
    if (n2 !== null) { somas[1] += n2; qtds[1]++; }
    if (n3 !== null) { somas[2] += n3; qtds[2]++; }
  });

  const mediasTrimestres = [
    qtds[0] > 0 ? Math.round((somas[0] / qtds[0]) * 10) / 10 : null,
    qtds[1] > 0 ? Math.round((somas[1] / qtds[1]) * 10) / 10 : null,
    qtds[2] > 0 ? Math.round((somas[2] / qtds[2]) * 10) / 10 : null
  ];

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  graficoEvolucao = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['1º Tri', '2º Tri', '3º Tri'],
      datasets: [{
        label: 'Média Geral',
        data: mediasTrimestres,
        borderColor: '#ff9900',
        backgroundColor: 'rgba(255, 153, 0, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: '#ffcc00',
        pointRadius: 6,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const v = context.raw;
              if (v === null) return 'Média Geral: —';
              return 'Média Geral: ' + String(v).replace('.', ',');
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById('graficoFaltasTrimestres');
  if (!canvas) return;

  let faltasT1 = 0;
  let faltasT2 = 0;
  let faltasT3 = 0;

  dadosAtuais.forEach(item => {
    if (Array.isArray(item.faltas)) {
      faltasT1 += Number(item.faltas[0] || 0);
      faltasT2 += Number(item.faltas[1] || 0);
      faltasT3 += Number(item.faltas[2] || 0);
    }
  });

  const totalAcumulado = faltasT1 + faltasT2 + faltasT3;
  const LIMITE_RISCO_INTERNO = 350;

  const divEstado = document.getElementById('estadoFaltas');
  const cardFaltas = document.getElementById('card-grafico-faltas');

  if (divEstado && cardFaltas) {
    if (totalAcumulado >= LIMITE_RISCO_INTERNO) {
      divEstado.innerHTML = '<span class="badge-perigo">Perigo</span>';
      cardFaltas.classList.add('card-perigo');
    } else {
      divEstado.innerHTML = '';
      cardFaltas.classList.remove('card-perigo');
    }
  }

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  graficoFaltas = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['1º Tri', '2º Tri', '3º Tri'],
      datasets: [{
        label: 'Faltas no Trimestre',
        data: [faltasT1, faltasT2, faltasT3],
        backgroundColor: '#2ecc71',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff', stepSize: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#ffffff' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.raw + ' faltas';
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// Configuração dos eventos da página
document.getElementById('btn-entrar').addEventListener('click', autenticarEAbrir);
document.getElementById('campo-pin').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') autenticarEAbrir();
});

document.getElementById('btn-alterar-dados').addEventListener('click', abrirEdicao);
document.getElementById('btn-salvar').addEventListener('click', salvarAlteracoes);
document.getElementById('btn-cancelar').addEventListener('click', cancelarEdicao);
