// Dados fictícios padronizados do 9º Ano
const materias = [
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
// Nota: no futuro, este valor será calculado de forma dinâmica a partir dos dados reais.
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Função para normalizar notas na escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Troca vírgula por ponto para converter strings em números
  if (typeof valor === 'string') {
    valor = valor.replace(',', '.');
  }

  let num = Number(valor);

  // Se não for um número válido, descarta
  if (isNaN(num)) {
    return null;
  }

  // Se o valor estiver acima de 10 e até 100, divide por 10
  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  // Se estiver na escala correta (0 a 10), retorna com uma casa decimal
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

// Função principal que constrói a tabela e atualiza os cards
function carregarBoletim() {
  const corpoTabela = document.getElementById('corpo-tabela');
  corpoTabela.innerHTML = '';

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  // Percorre cada disciplina da lista
  materias.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média usando apenas as notas disponíveis
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

    // Soma as faltas dos três trimestres
    const totalFaltasDisc = item.faltas.reduce((acc, curr) => acc + curr, 0);
    totalFaltasGeral += totalFaltasDisc;

    // Formatação dos textos para a tabela
    const txt1 = n1 !== null ? n1.toFixed(1).replace('.', ',') : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace('.', ',') : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace('.', ',') : "—";
    const txtMedia = media !== null ? media.toFixed(1).replace('.', ',') : "—";

    // Cria a linha na tabela via DOM
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td class="${getClasseNota(n1)}">${txt1}</td>
      <td class="${getClasseNota(n2)}">${txt2}</td>
      <td class="${getClasseNota(n3)}">${txt3}</td>
      <td class="${getClasseNota(media)}"><strong>${txtMedia}</strong></td>
      <td>${totalFaltasDisc}</td>
      <td><span class="${situacaoClasse}">${situacaoTexto}</span></td>
    `;
    corpoTabela.appendChild(tr);
  });

  // Atualiza os dados nos Cards de Resumo
  const mediaGeralFinal = qtdDisciplinasComMedia > 0 
    ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace('.', ',') 
    : "—";

  document.getElementById('card-media').innerText = mediaGeralFinal;
  document.getElementById('card-faltas').innerText = totalFaltasGeral;
  document.getElementById('card-bom-desempenho').innerText = qtdBomDesempenho;
  document.getElementById('card-atencao').innerText = qtdAtencao;
}

// Inicializa a montagem do boletim assim que a página carrega
carregarBoletim();