// script.js
document.getElementById('device-type').addEventListener('change', function () {
  const deviceType = this.value;

  fetch(`/dashboard?deviceType=${deviceType}`)
      .then(response => response.text())
      .then(html => {
          document.querySelector('main.dashboard').innerHTML = html;
      })
      .catch(error => console.error('Erro ao carregar dispositivos:', error));
});



// const userDevices = {
//   Ana: {
//     energyProduced: [400, 600, 700, 800],
//     efficiency: [85, 90, 87, 92],
//     distribution: [50, 50],
//     economy: [60, 40],
//   },
//   Beatriz: {
//     energyProduced: [500, 700, 600, 750],
//     efficiency: [80, 85, 88, 91],
//     distribution: [70, 30],
//     economy: [70, 30],
//   }
// };

// const currentUser = localStorage.getItem('currentUser');
// if (!currentUser) {
//   alert('Você não está logado!');
//   window.location.href = '../html/login.html'; // Redireciona para login
// }

// async function fetchWeatherData(city) {
//   const apiKey = '75ed360115daebfaab9591d500b6f2df'; // Substitua pela sua chave da API
//   const url = `https://api.openweathermap.org/data/2.5/forecast?q=São Paulo&appid=${apiKey}&units=metric`;

//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error('Erro ao buscar dados climáticos.');
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Erro:', error);
//     return null;
//   }
// }

// function calculateEnergyPrediction(weatherData, deviceType) {
//   const predictions = [];

//   // Itera pelos dados da previsão (a cada 3 horas)
//   weatherData.list.forEach((entry) => {
//     const windSpeed = entry.wind.speed; // Velocidade do vento (m/s)
//     const solarIntensity = entry.clouds.all; // Nível de nuvens (%)
//     let energy = 0;

//     if (deviceType === 'solar') {
//       // Energia solar: inversamente proporcional à cobertura de nuvens
//       energy = Math.max(0, (100 - solarIntensity) * 0.1);
//     } else if (deviceType === 'wind') {
//       // Energia eólica: proporcional à velocidade do vento
//       energy = Math.max(0, windSpeed * 0.5);
//     } else if (deviceType === 'all') {
//       // Combinação de energia solar e eólica
//       const solarEnergy = Math.max(0, (100 - solarIntensity) * 0.1);
//       const windEnergy = Math.max(0, windSpeed * 0.5);
//       energy = solarEnergy + windEnergy;
//     }

//     predictions.push(energy);
//   });

//   return predictions.slice(0, 7); // Retorna os próximos 7 períodos (1 semana)
// }

// async function updateEnergyPredictionChart(deviceType) {
//   const city = 'São Paulo'; // Defina a cidade desejada
//   const weatherData = await fetchWeatherData(city);

//   if (weatherData) {
//     const predictions = calculateEnergyPrediction(weatherData, deviceType);

//     prevChart.data.labels = predictions.map((_, i) => `Dia ${i + 1}`);
//     prevChart.data.datasets = [
//       {
//         label: deviceType === 'all' ? 'Previsão Total (kWh)' : `Previsão ${deviceType} (kWh)`,
//         data: predictions,
//         borderColor: deviceType === 'solar' ? 'rgba(255, 206, 86, 0.8)' : 'rgba(75, 192, 192, 0.8)',
//         backgroundColor: deviceType === 'solar' ? 'rgba(255, 206, 86, 0.2)' : 'rgba(75, 192, 192, 0.2)',
//         borderWidth: 2,
//       },
//     ];

//     prevChart.update();
//   }
// }

// // Configuração dos Gráficos
// const energyProducedCtx = document.getElementById('energyProducedChart').getContext('2d');
// const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
// const prevCtx = document.getElementById('prevChart').getContext('2d');
// const timeLossCtx = document.getElementById('timeLossChart').getContext('2d');
// const economyCtx = document.getElementById('economyChart').getContext('2d');
// const roiCtx = document.getElementById('roiChart').getContext('2d');
// const performanceCtx = document.getElementById('performanceChart').getContext('2d');

// document.getElementById('device-type').addEventListener('change', function () {
//   const selectedDevice = this.value; // Obtém o valor selecionado
//   updateEnergyPredictionChart(selectedDevice); // Atualiza o gráfico de previsão
// });

// document.addEventListener('DOMContentLoaded', () => {
//   updateEnergyPredictionChart('all');
// });

// function updateCharts(deviceType) {
//   // Filtra os dados com base no tipo de dispositivo
//   const filteredData = filterDataByDeviceType(deviceType);

//   // Atualiza cada gráfico com os dados filtrados
//   energyProducedChart.data.datasets[0].data = filteredData.energyProduced;
//   energyProducedChart.update();

//   efficiencyChart.data.datasets[0].data = filteredData.efficiency;
//   efficiencyChart.update();

//   prevChart.data.datasets[0].data = filteredData.prev;
//   prevChart.update();

//   timeLossChart.data.datasets[0].data = filteredData.timeLoss;
//   timeLossChart.update();

//   economyChart.data.datasets[0].data = filteredData.economy;
//   economyChart.update();

//   performanceChart.data.datasets[0].data = filteredData.performance;
//   performanceChart.update();
// }

// function filterDataByDeviceType(deviceType) {
//   const allData = userDevices[currentUser]; // Obtém os dados do usuário atual

//   if (deviceType === 'all') {
//     // Retorna todos os dados se "Todos os Dispositivos" for selecionado
//     return allData;
//   }

//   // Filtragem fictícia: simular divisão entre solar e eólico
//   if (deviceType === 'solar') {
//     return {
//       energyProduced: allData.energyProduced.map(e => e * 0.6), // Exemplo de 60% solar
//       efficiency: allData.efficiency.map(e => e * 0.7),
//       prev: [50, 60],
//       timeLoss: [70, 30],
//       economy: [50, 50],
//       performance: [80, 20],
//     };
//   } else if (deviceType === 'wind') {
//     return {
//       energyProduced: allData.energyProduced.map(e => e * 0.4), // Exemplo de 40% eólico
//       efficiency: allData.efficiency.map(e => e * 0.3),
//       prev: [30, 40],
//       timeLoss: [50, 50],
//       economy: [30, 70],
//       performance: [60, 40],
//     };
//   }

//   // Retorna dados vazios como fallback
//   return {
//     energyProduced: [0, 0, 0, 0],
//     efficiency: [0, 0, 0, 0],
//     prev: [0, 0],
//     timeLoss: [0, 0],
//     economy: [0, 0],
//     performance: [0, 0],
//   };
// }

// // Obtém os dados do usuário atual
// const userData = userDevices[currentUser] || {
//   energyProduced: [0, 0, 0, 0],
//   efficiency: [0, 0, 0, 0],
//   prev: [0, 0],
//   timeLoss: [0 , 0 , 0, 0],
//   economy: [0, 0],
//   roi: [0, 0],
//   performance: [0, 0 , 0]
// };

// // Cria os gráficos usando os dados do usuário
// const energyProducedChart  = new Chart(energyProducedCtx, {
//   type: 'bar',
//   data: {
//     labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
//     datasets: [{
//       label: 'Energia Produzida (kWh)',
//       data: userData.energyProduced,
//       backgroundColor: 'rgba(0, 128, 0, 0.6)',
//     }]
//   },
//   options: {
//     responsive: true,
//   }
// });

// const efficiencyChart  = new Chart(efficiencyCtx, {
//   type: 'line',
//   data: {
//     labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
//     datasets: [{
//       label: 'Eficiência (%)',
//       data: userData.efficiency,
//       borderColor: '#FF5722', // Ajuste a cor da linha
//       borderWidth: 2,
//       fill: true, // Preenche a área abaixo da linha
//       backgroundColor: 'rgba(255, 87, 34, 0.2)' // Cor de preenchimento
//     }]
//   },
//   options: {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top'
//       }
//     }
//   }
// });

// let prevChart; // Declare o gráfico fora do escopo inicial

// document.addEventListener('DOMContentLoaded', () => {
//   // Inicialize o gráfico aqui
//   prevChart = new Chart(prevCtx, {
//     type: 'line',
//     data: {
//       labels: [], // Inicializa sem labels
//       datasets: [],
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           position: 'top',
//         },
//       },
//       scales: {
//         x: {
//           title: {
//             display: true,
//             text: 'Dias',
//           },
//         },
//         y: {
//           title: {
//             display: true,
//             text: 'Energia (kWh)',
//           },
//           beginAtZero: true,
//         },
//       },
//     },
//   });

//   updateEnergyPredictionChart('all');
// });

// const timeLossChart  = new Chart(timeLossCtx, {
//   type: 'doughnut', 
//   data: {
//     labels: ['Tempo gerando energia', 'Tempo parado'],
//     datasets: [{
//       data: userData.timeLoss,
//       backgroundColor: ['#FFC107', '#FF5722'],
//   }]
//   },
//   options: {
//     responsive: true
//   }
// });

// const economyChart  = new Chart(economyCtx, {
//   type: 'doughnut',
//   data: {
//     labels: ['Economia', 'Outros Custos'],
//     datasets: [{
//       data: userData.economy, // Certifique-se que os dados estejam preenchidos corretamente
//       backgroundColor: ['#FFC107', '#4CAF50'], // Ajuste conforme a imagem
//       hoverOffset: 4, // Adiciona destaque ao passar o mouse
//     }]
//   },
//   options: {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'bottom', // Posiciona a legenda embaixo do gráfico
//         labels: {
//           font: {
//             size: 14 // Ajuste o tamanho da fonte
//           }
//         }
//       }
//     }
//   }
// });

// const performanceChart  = new Chart(performanceCtx, {
//   type: 'doughnut',
//   data: {
//     labels: ['', ''],
//     datasets: [{
//       data: userData.performance,
//       backgroundColor: ['#FFC107', '#FF5722'],
//     }]
//   },
//   options: {
//     responsive: true,
//   }
// });

// function addDevice() {
//   const newDeviceType = prompt('Qual tipo de dispositivo você quer adicionar? (Solar/Eólico)');
//   if (newDeviceType) {
//     alert(`Dispositivo ${newDeviceType} adicionado com sucesso!`);

//     const newEnergyProduced = Math.floor(Math.random() * 500);
//     userData.energyProduced.push(newEnergyProduced);

//     energyProducedChart.data.datasets[0].data = userData.energyProduced;
//     energyProducedChart.update(); // Atualiza o gráfico sem recarregar
//   }
// }

// document.getElementById('add-device').addEventListener('click', addDevice);