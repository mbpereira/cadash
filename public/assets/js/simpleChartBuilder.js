const buildSimpleChart = ({ data, chartId, title, type, getLabel, getValue, displayLegend }) => {
  data = data.sort((a, b) => b.count - a.count)
  const ctx = document.getElementById(chartId).getContext('2d')
  return new Chart(ctx, {
    type,
    data: {
      labels: data.map(getLabel),
      datasets: [{
        label: '# of Votes',
        data: data.map(getValue),
        backgroundColor:
          data.map(generateRandomRgba),
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          text: title,
          display: true
        },
        legend: {
          display: displayLegend
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}