// Dashboard Charts Implementation
const OPENWEATHERMAP_API_KEY = '3647e77e6305db1ecaa9d374d19622de';
const LATITUDE = -23.5505;
const LONGITUDE = -46.6333;

// Format device data for charts
function formatDeviceData(devices) {
    console.log('Raw device data:', devices);
    
    // Criar dados diários a partir dos valores totais
    const today = moment().startOf('day'); // Certifique-se de que o horário é 00:00
    const dates = Array.from({ length: 7 }, (_, i) => 
    moment(today).subtract(i, 'days').format('YYYY-MM-DD')
    ).reverse();

    // Distribuir os valores totais ao longo dos dias
    const formattedData = dates.map((date, index) => {
        const totalProducao = devices.reduce((sum, device) => 
            sum + (parseFloat(device.energy || 0) / dates.length) * (index + 1), 0);
        const totalConsumo = devices.reduce((sum, device) => 
            sum + (parseFloat(device.consumed || 0) / dates.length) * (index + 1), 0);

        return {
            date,
            producao: totalProducao,
            consumo: totalConsumo,
            performance: totalProducao > 0 ? 
                ((totalProducao - totalConsumo) / totalProducao) * 100 : 0
        };
    });

    console.log('Formatted data:', formattedData);
    return formattedData;
}

// Create or update chart
function createChart(ctx, label, data, type = 'line') {
    const chartId = ctx.canvas.id;
    
    if (window.chartInstances?.[chartId]) {
        window.chartInstances[chartId].destroy();
    }

    const yKey = chartId === 'productionChart' ? 'producao' :
                 chartId === 'consumptionChart' ? 'consumo' :
                 chartId === 'performanceChart' ? 'performance' : 'value';

    window.chartInstances = window.chartInstances || {};
    window.chartInstances[chartId] = new Chart(ctx, {
        type,
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: label,
                data: data.map(d => ({
                    x: d.date,
                    y: d[yKey] || d.value || 0
                })),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { 
                    display: true, 
                    text: label 
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const unit = chartId === 'performanceChart' ? '%' :
                                       chartId === 'windSpeedChart' ? 'm/s' :
                                       chartId === 'solarIrradiationChart' ? '%' : 'kWh';
                            return `${label}: ${value.toFixed(2)} ${unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'DD/MM/YYYY'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: chartId === 'performanceChart' ? 'Performance (%)' :
                              chartId === 'windSpeedChart' ? 'Velocidade (m/s)' :
                              chartId === 'solarIrradiationChart' ? 'Irradiação (%)' :
                              'Energia (kWh)'
                    }
                }
            }
        }
    });
}

async function loadDataAndCreateCharts() {
    try {
        console.log('Loading charts with device data:', window.deviceData);
        
        // Process device data
        const formattedData = formatDeviceData(window.deviceData || []);

        // Create production chart
        const productionCtx = document.getElementById('productionChart')?.getContext('2d');
        if (productionCtx) {
            createChart(productionCtx, 'Produção de Energia', formattedData);
        }

        // Create consumption chart
        const consumptionCtx = document.getElementById('consumptionChart')?.getContext('2d');
        if (consumptionCtx) {
            createChart(consumptionCtx, 'Consumo de Energia', formattedData);
        }

        // Create performance chart
        const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
        if (performanceCtx) {
            createChart(performanceCtx, 'Desempenho', formattedData);
        }

        // Get weather data for estimates
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        // Get selected device type
        const deviceType = document.getElementById('device-type')?.value;

        // Weather-based charts: only show relevant charts based on selected device type
        if (deviceType === 'eolica' || deviceType === 'all') {
            const windCtx = document.getElementById('windSpeedChart')?.getContext('2d');
            if (windCtx) {
                const windData = weatherData.list.map(item => ({
                    date: moment(item.dt * 1000).format('YYYY-MM-DD'),
                    value: item.wind.speed
                }));
                createChart(windCtx, 'Velocidade do Vento', windData);
            }
        } else {
            // Hide wind speed chart if not selected
            document.getElementById('windSpeedChart').parentElement.parentElement.style.display = 'none';
        }

        if (deviceType === 'solar' || deviceType === 'all') {
            const solarCtx = document.getElementById('solarIrradiationChart')?.getContext('2d');
            if (solarCtx) {
                const solarData = weatherData.list.map(item => ({
                    date: moment(item.dt * 1000).format('YYYY-MM-DD'),
                    value: 100 - item.clouds.all
                }));
                createChart(solarCtx, 'Irradiação Solar', solarData);
            }
        } else {
            // Hide solar irradiation chart if not selected
            document.getElementById('solarIrradiationChart').parentElement.parentElement.style.display = 'none';
        }

    } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
    }
}

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing charts...');
    loadDataAndCreateCharts();
});

// Update charts when device type changes
document.getElementById('device-type')?.addEventListener('change', loadDataAndCreateCharts);

// Handle sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.querySelector('[data-bs-toggle="collapse"]');
    
    toggleButton?.addEventListener('click', function() {
        sidebar?.classList.toggle('show');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInside = sidebar?.contains(event.target) || 
                            toggleButton?.contains(event.target);
        if (!isClickInside && sidebar?.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });
});

// Handle device submenu toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-devices');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subMenu = button.nextElementSibling;
            if (subMenu) {
                subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
});