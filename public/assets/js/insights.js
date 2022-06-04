((axios) => {
  const http = axios.create({
    baseUrl: window.location.protocol + window.location.host
  })

  const insightLoadingSpinner = document.getElementById('insight_loading_spinner')
  const insightSelectedYear = document.getElementById('insight_year')
  const insightRefreshBtn = document.getElementById('refresh_insight_year')

  let currentData = []
  let mostUsedDatabaseChart, mostDesiredDatabaseChart, mostCommonJobsChart, mostUsedLanguageChart, mostDesiredLanguageChart

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
      type: 'bar',
      getLabel: d => d.job,
      getValue: d => d.count,
      indexAxis: 'y'
    })
  }

  const buildMostUsedLanguageChart = () => {
    if (mostUsedLanguageChart)
      mostUsedLanguageChart.destroy()

    mostUsedLanguageChart = buildSimpleChart({
      data: currentData.mostUsedLanguages,
      chartId: 'most_used_language_chart',
      title: 'Most used languages',
      type: 'bar',
      getLabel: d => d.language,
      getValue: d => d.count,
      indexAxis: 'y'
    })
  }

  const buildMostDesiredLanguageChart = () => {
    if (mostDesiredLanguageChart)
      mostDesiredLanguageChart.destroy()

    mostDesiredLanguageChart = buildSimpleChart({
      data: currentData.mostDesiredLanguages,
      chartId: 'most_desired_language_chart',
      title: 'Most desired languages',
      type: 'bar',
      getLabel: d => d.language,
      getValue: d => d.count,
      indexAxis: 'y'
    })
  }

  const buildCharts = () => {
    buildMostUsedDatabaseChart()
    buildMostDesiredDatabaseChart()
    buildMostCommonJobsChart()
    buildMostUsedLanguageChart()
    buildMostDesiredLanguageChart()
  }

  const loadData = (year, refresh) => {
    insightLoadingSpinner.classList.remove('d-none')
    http.get(`/api/analytics/${year}?refresh=${!!refresh}`)
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

  insightRefreshBtn.addEventListener('click', () => {
    loadData(insightSelectedYear.value, true)
  })

})(axios)