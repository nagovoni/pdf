const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const PDFDocument = require('pdfkit');
const fs = require('fs');


// Configurações do ChartJSNodeCanvas
const width = 400; // Largura do gráfico
const height = 200; // Altura do gráfico
const chartCallback = (ChartJS) => {
    // Configurações adicionais ou plugins podem ser registrados aqui, se necessário
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

// Função para criar o gráfico da taxa de ocupação
async function createOccupancyChart(percentage) {
    const configuration = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentage, 100 - percentage],  // Valores da taxa de ocupação
                backgroundColor: ['#D43F3F', '#e6e6e6'],  // Cor do preenchimento
                borderWidth: 0  // Remover bordas ao redor dos segmentos
            }]
        },
        options: {
            rotation: -90,  // Rota 90 graus para iniciar na posição correta (topo)
            circumference: 180,  // Mostra apenas metade do círculo (semicírculo)
            cutout: '80%',  // Faz o "buraco" no meio do gráfico
            plugins: {
                tooltip: { enabled: false },  // Desativar tooltips
                datalabels: { display: false }  // Desativar datalabels (caso esteja usando o plugin)
            }
        }
    };
    
    // Renderiza o gráfico como uma imagem de buffer
    return await chartJSNodeCanvas.renderToBuffer(configuration);
}


// Função para criar o PDF

async function createPDF() {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Stream the PDF into a file
  doc.pipe(fs.createWriteStream('Rendimento-Mensal-Marco-2023.pdf'));

  // Adicionando o logotipo no canto superior direito
  const logoPath = 'src/360logo.png'; 
  doc.image(logoPath, 450, 50, { width: 80 }); // Adiciona a imagem no canto superior direito

  // Título
  doc.fillColor('#000000').fontSize(20).text('RENDIMENTO - MENSAL', { align: 'left' });
  doc.font('Helvetica-Bold').fillColor('#D43F3F').fontSize(14).text('MARÇO 2023', { align: 'left' });

// Função para adicionar informações do proprietário
function addLabelAndValue(label, value) {
    doc.moveDown().fontSize(12).fillColor('gray').text(label);  // Label em cinza
    doc.fontSize(12).fillColor('black').text(value);            // Valor em preto
  }

  // Informações do Proprietário
  addLabelAndValue('Proprietário(a):', 'Juliana Bertinatto Pereira Maluf');
  addLabelAndValue('CPF / CNPJ:', '034.773.416-27');
  addLabelAndValue('Edifício:', '360 Brooklin');
  addLabelAndValue('Unidade:', '104');
  addLabelAndValue('Localização:', 'Rua das Sempre-Vivas, 21');

// Adicionar "Taxa de Ocupação Mensal" acima do gráfico
doc.fillColor('#000000').fontSize(12).text('Taxa Ocupação Mensal', 330, 150);

// Gerar gráfico da taxa de ocupação
const percentage = 48;  // Taxa de ocupação
const chartImage = await createOccupancyChart(percentage);

// Adicionar o valor "48%" abaixo do gráfico
doc.fillColor('#000000').fontSize(30).text(`${percentage}%`, 250, 220, { align: 'center' });
doc.fillColor('gray').fontSize(10).text('Ocupado', 370, 250);

// Adicionar o gráfico da taxa de ocupação ao PDF
doc.image(chartImage, 320, 170, { width: 150, height: 75 });

        // Informações de Reservas lado a lado
    doc.moveDown().fontSize(10).fillColor('gray').text('Reservas Confirmadas', 50, 320);
    doc.fillColor('black').fontSize(30).text('2', 95, 340);
    
    doc.fillColor('gray').fontSize(10).text('Noites Vendidas', 180, 320);
    doc.fillColor('black').fontSize(30).text('15', 200, 340);

    doc.fillColor('gray').fontSize(10).text('Estadia Média', 300, 320);
    doc.fillColor('black').fontSize(30).text('3,5', 310, 340);

    doc.fillColor('gray').fontSize(10).text('Diária Média', 450, 320);
    doc.fillColor('black').fontSize(30).text('R$ 237,18', 405, 340);

    // Adicionar uma quebra de linha antes de "Faturamento"
    doc.moveDown().text('',50); // Adiciona uma linha em branco

   
  // Função para formatar o texto com valores
function addTextWithValue(text, value, isFaturamentoOrRepasse = false, isImportant=false) {
    if (isImportant) {
        // Aumenta a fonte se for um texto importante (Faturamento ou Repasse)
        doc.fontSize(18).fillColor('black').text(`${text}:`, { continued: true });
      } else {
        // Usa o tamanho de fonte padrão se não for importante
        doc.fontSize(12).fillColor('black').text(`${text}:`, { continued: true });
      }
    
    // Verifica se é Faturamento ou Repasse
    if (isFaturamentoOrRepasse) {
        doc.fillColor('black'). fontSize(15).text(`${value}`, { align: 'right' }); // Alinha o valor à direita
    } else {
        doc.fillColor('#D43F3F').text(`${value}`, { align: 'right' }); // Usa a cor vermelha para outros valores
    }
}

// Faturamento
addTextWithValue('Faturamento', 'R$ 3.557,70', true, true); // Passa true para Faturamento

doc.moveDown(); // Adiciona uma linha em branco
// Desenhar uma linha abaixo do texto em cinza
let y = 440; // Posição vertical atual
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown(); // Adiciona uma linha em branco
// Move o y manualmente para a próxima linha ou posição desejada
y += 40; // Ajusta o valor de y 
// Despesas (Taxas e Descontos)
addTextWithValue('Taxa 360 Suítes', '- R$ 500,00');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown(); // Adiciona uma linha em branco
y += 35;
addTextWithValue('Energia & Elétrica', '- R$ 125,00');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown();
y += 25;
addTextWithValue('IPTU', '- R$ 104,28');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown();
y += 30;
addTextWithValue('Internet', '- R$ 80,00');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown();
y += 30;
addTextWithValue('Seguro Residencial', '- R$ 80,00');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown();
y += 30;
addTextWithValue('Prov. Manutenção', '- R$ 80,00');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown();
y += 30;
addTextWithValue('Outros', '- R$ 1.029,00');
doc.moveTo(50, y).lineTo(550, y).strokeColor('#D3D3D3').stroke(); // Desenha a linha
doc.moveDown();
y += 40;

doc.moveDown(); // Adiciona uma linha em branco

// Valor de Repasse
addTextWithValue('Valor de Repasse', 'R$ 1.100,60', true, true); // Passa true para Repasse

  // Finalizar o PDF
  doc.end();
}

createPDF();
