const OPENWEATHERMAP_API_KEY = '3647e77e6305db1ecaa9d374d19622de';
const LATITUDE = -23.5505;
const LONGITUDE = -46.6333;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing charts...');
    loadDataAndCreateCharts();
});

async function loadDataAndCreateCharts() {
    try {
        console.log('Loading charts with device data:', window.deviceData);
        
        const productionCtx = document.getElementById('productionChart').getContext('2d');
        const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        const productionVsConsumptionCtx = document.getElementById('productionVsConsumptionChart').getContext('2d');
        
        createProductionChart(productionCtx, window.deviceData);
        createConsumptionChart(consumptionCtx, window.deviceData);
        createPerformanceChart(performanceCtx, window.deviceData);
        createProductionVsConsumptionChart(productionVsConsumptionCtx, window.deviceData);

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
                createWeatherChart(windCtx, 'Velocidade do Vento', windData, 'm/s');
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
                createWeatherChart(solarCtx, 'Irradiação Solar', solarData, '%');
            }
        } else {
            // Hide solar irradiation chart if not selected
            document.getElementById('solarIrradiationChart').parentElement.parentElement.style.display = 'none';
        }

    } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
    }
}

function createProductionChart(ctx, devices) {
    const datasets = devices.map(device => {
        const data = device.readings.map(reading => ({
            x: new Date(reading.timestamp),
            y: reading.energia_produzida
        }));
        return {
            label: device.device.nome_dispositivo,
            data: data,
            borderColor: getRandomColor(),
            fill: false
        };
    });

    createChart(ctx, 'Produção de Energia', datasets, 'kWh');
}

function createConsumptionChart(ctx, devices) {
    const datasets = devices.map(device => {
        const data = device.readings.map(reading => ({
            x: new Date(reading.timestamp),
            y: reading.energia_consumida
        }));
        return {
            label: device.device.nome_dispositivo,
            data: data,
            borderColor: getRandomColor(),
            fill: false
        };
    });

    createChart(ctx, 'Consumo de Energia', datasets, 'kWh');
}

function createPerformanceChart(ctx, devices) {
    const datasets = devices.map(device => {
        const data = device.readings.map(reading => ({
            x: new Date(reading.timestamp),
            y: (reading.energia_produzida - reading.energia_consumida) / reading.energia_produzida * 100
        }));
        return {
            label: device.device.nome_dispositivo,
            data: data,
            borderColor: getRandomColor(),
            fill: false
        };
    });

    createChart(ctx, 'Desempenho', datasets, '%');
}

function createWeatherChart(ctx, label, data, unit) {
    const dataset = {
        label: label,
        data: data.map(d => ({
            x: d.date,
            y: d.value
        })),
        borderColor: getRandomColor(),
        fill: false
    };

    createChart(ctx, label, [dataset], unit);
}

function createChart(ctx, label, datasets, unit) {
    new Chart(ctx, {
        type: 'line',
        data: { datasets },
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
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${unit}`;
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
                        text: `${label} (${unit})`
                    }
                }
            }
        }
    });
}

function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

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

function createProductionVsConsumptionChart(ctx, devices) {
    const productionData = [];
    const consumptionData = [];

    devices.forEach(device => {
        device.readings.forEach(reading => {
            const date = new Date(reading.timestamp);
            productionData.push({ x: date, y: reading.energia_produzida });
            consumptionData.push({ x: date, y: reading.energia_consumida });
        });
    });

    const datasets = [
        {
            label: 'Produção',
            data: productionData,
            borderColor: 'rgb(75, 192, 192)',
            fill: false
        },
        {
            label: 'Consumo',
            data: consumptionData,
            borderColor: 'rgb(255, 99, 132)',
            fill: false
        }
    ];

    createChart(ctx, 'Produção x Consumo', datasets, 'kWh');
}

// Handle device deletion
document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-device');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    let deviceIdToDelete;

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            deviceIdToDelete = this.getAttribute('data-device-id');
            $('#confirmDeleteModal').modal('show');
        });
    });

    confirmDeleteButton.addEventListener('click', function() {
        if (deviceIdToDelete) {
            // Send delete request to server
            fetch(`/delete-device/${deviceIdToDelete}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the device from the table
                    const row = document.querySelector(`button[data-device-id="${deviceIdToDelete}"]`).closest('tr');
                    row.remove();
                    // Update the device count
                    updateDeviceCount();
                } else {
                    alert('Erro ao excluir o dispositivo. Por favor, tente novamente.');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao excluir o dispositivo. Por favor, tente novamente.');
            })
            .finally(() => {
                $('#confirmDeleteModal').modal('hide');
                deviceIdToDelete = null;
            });
        }
    });

    function updateDeviceCount() {
        const deviceCountElement = document.querySelector('.card-text.display-9');
        if (deviceCountElement) {
            let count = parseInt(deviceCountElement.textContent);
            deviceCountElement.textContent = count - 1;
        }
    }
});

