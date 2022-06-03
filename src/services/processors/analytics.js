const { insightCsv } = require('../../utils/app')
const cache = require('../cache')
const { createFileReader } = require('../readers/file')

const getMostUsedDatabases = rawData => {
  return rawData.reduce((mostUsedDatabases, record) => {
    const databases = record.workedItDatabases.split(';')

    databases.forEach(db => {
      const foundDatabase = mostUsedDatabases.find(d => d.database === db)
      if (foundDatabase) return foundDatabase.count++

      mostUsedDatabases.push({
        database: db,
        count: 1
      })
    })

    return mostUsedDatabases
  }, [])
}

const getMostDesiredDatabases = rawData => {
  return rawData.reduce((mostDesiredDatabases, record) => {
    const databases = record.wantToWorkDatabases.split(';')

    databases.forEach(db => {
      const foundDatabase = mostDesiredDatabases.find(d => d.database === db)
      if (foundDatabase) return foundDatabase.count++

      mostDesiredDatabases.push({
        database: db,
        count: 1
      })
    })

    return mostDesiredDatabases
  }, [])
}

const getMostUsedDatabasesByCountries = rawData => {
  return rawData.reduce((mostUsedDatabases, record) => {
    const databases = record.wantToWorkDatabases.split(';')
    const country = record.country

    databases.forEach(db => {
      const foundDatabase = mostUsedDatabases.find(d => d.database === db && d.country === country)
      if (foundDatabase) return foundDatabase.count++

      mostUsedDatabases.push({
        database: db,
        count: 1,
        country
      })
    })

    return mostUsedDatabases
  }, [])
}

const getMostCommonJobs = rawData =>
  rawData.reduce((mostCommonJobs, record) => {
    const jobs = record.jobs.split(';')

    jobs.forEach(job => {
      const foundJob = mostCommonJobs.find(d => d.job === job)
      if (foundJob) return foundJob.count++

      mostCommonJobs.push({
        job: job,
        count: 1
      })
    })

    return mostCommonJobs
  }, [])

const schemas = {
  '2021': {
    'workedItDatabases': {
      index: 18,
    },
    'wantToWorkDatabases': {
      index: 19
    },
    'country': {
      index: 3
    },
    'jobs': {
      index: 11
    }
  },
  '2020': {
    'workedItDatabases': {
      index: 12,
    },
    'wantToWorkDatabases': {
      index: 11
    },
    'country': {
      index: 8
    },
    'jobs': {
      index: 13
    }
  },
  '2019': {
    'workedItDatabases': {
      index: 45,
    },
    'wantToWorkDatabases': {
      index: 46
    },
    'country': {
      index: 6
    },
    'jobs': {
      index: 12
    }
  },
  '2018': {
    'workedItDatabases': {
      index: 67,
    },
    'wantToWorkDatabases': {
      index: 68
    },
    'country': {
      index: 3
    },
    'jobs': {
      index: 9
    }
  }
}

const read = year => new Promise((res, rej) => {
  const parse = ({ chunks }) => {
    const from = 1
    const records = chunks.slice(from).map(c => {
      const record = {}
      Object.keys(schemas[year]).forEach(prop => {
        const lineData = c.split(',')
        const propIndex = schemas[year][prop].index
        record[prop] = lineData[propIndex]
      })
      return record
    })
    res({ year, records })
  }
  const csv = insightCsv(year)
  createFileReader({ input: csv })
    .transform(line => {
      processedLine = line
      const matches = processedLine.match(/"(.*?)"/ig)
      if (Array.isArray(matches))
        matches.forEach(m => processedLine = processedLine.replace(m, m.replace(/,/ig, ' -')))
      return processedLine
    })
    .transform(line => line.replace(/"/ig, ''))
    .read()
    .onFinish(parse)
    .onError(rej)
})

const analyze = ({ year, records }) => {
  return {
    year,
    mostUsedDatabases: getMostUsedDatabases(records),
    mostCommonJobs: getMostCommonJobs(records),
    mostDesiredDatabases: getMostDesiredDatabases(records),
    mostUsedDatabasesByCountries: getMostUsedDatabasesByCountries(records)
  }
}

const setCache = (key, value) => cache.set(key, value)
const getCache = key => cache.get(key)

const validYears = ['2021', '2020', '2019', '2018']

const getCachedAnalyzes = async () => {
  const analyzes = await Promise.all(validYears.map(getCache))
  return analyzes.filter(analyze => !!analyze)
}

const getPendingAnalyzes = async () => {
  const cachedAnalyzes = (await getCachedAnalyzes()).map(a => a.year)
  return validYears.filter(y => !cachedAnalyzes.includes(y))
}

const makeAnalyzes = async pendingAnalyzes => {
  return await Promise.all(pendingAnalyzes.map(read))
    .then(years => years.map(analyze))
}

const cacheAnalyzes = async uncachedAnalyzes => {
  await Promise.all(uncachedAnalyzes.map(async analyze => {
    if (!await getCache(analyze.year))
      await setCache(analyze.year, analyze)
  }))
}

module.exports = {
  analyzeAllDisponibleYears: async () => {
    const pendingAnalyzes = await getPendingAnalyzes()
    const cachedAnalyzes = await getCachedAnalyzes()
    const analyzes = await makeAnalyzes(pendingAnalyzes)
    await cacheAnalyzes(analyzes)
    return [...analyzes, ...cachedAnalyzes]
  },
  analyze: year => {
    const cachedAnalyze = getCache(year)

    if (cachedAnalyze)
      return Promise.resolve(cachedAnalyze)

    return read(year)
      .then(analyze)
      .then(analyze => {
        setCache(year, analyze)
        return analyze
      })
  }
}