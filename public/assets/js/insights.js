((axios) => {
  const http = axios.create({
    baseUrl: window.location.protocol + window.location.host
  })

  const insightLoadingSpinner = document.getElementById('insight_loading_spinner')
  const insightSelectedYear = document.getElementById('insight_year')
  let currentData = []
  let mostUsedDatabaseChart, mostDesiredDatabaseChart, mostCommonJobsChart

  const buildMostUsedDatabaseChart = () => {
    if (mostUsedDatabaseChart)
      mostUsedDatabaseChart.destroy()
    mostUsedDatabaseChart = buildSimpleChart({
      data: currentData.mostUsedDatabases,
      chartId: 'most_used_database_chart',
      title: 'Most used databases',
      type: 'bar',
      getLabel: d => d.database,
      getValue: d => d.count
    })
  }

  const buildMostDesiredDatabaseChart = () => {
    if (mostDesiredDatabaseChart)
      mostDesiredDatabaseChart.destroy()
    mostDesiredDatabaseChart = buildSimpleChart({
      data: currentData.mostDesiredDatabases,
      chartId: 'most_desired_database_chart',
      title: 'Most desired databases',
      type: 'bar',
      getLabel: d => d.database,
      getValue: d => d.count
    })
  }

  const buildMostCommonJobsChart = () => {
    if (mostCommonJobsChart)
      mostCommonJobsChart.destroy()
    mostCommonJobsChart = buildSimpleChart({
      data: currentData.mostCommonJobs,
      chartId: 'most_common_jobs_chart',
      title: 'Most common jobs',
      type: 'pie',
      getLabel: d => d.job,
      getValue: d => d.count,
      displayLegend: false
    })
  }

  const buildCharts = () => {
    buildMostUsedDatabaseChart()
    buildMostDesiredDatabaseChart()
    buildMostCommonJobsChart()
  }

  const loadData = year => {
    insightLoadingSpinner.classList.remove('d-none')
    http.get(`/api/analytics/${year}`)
      .then(({ data }) => currentData = data)
      .then(buildCharts)
      .finally(() => insightLoadingSpinner.classList.add('d-none'))
  }

  insightSelectedYear.addEventListener('change', () => {
    loadData(insightSelectedYear.value)
  })

  window.addEventListener('load', () => {
    loadData(insightSelectedYear.value)
  })

})(axios)