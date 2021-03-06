const { insightCsv } = require('../../utils/app')
const { createCacheService } = require('../cache')
const { createFileReader } = require('../readers/file')

const cacheService = createCacheService()

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

const getMostUsedLanguages = rawData => {
  return rawData.reduce((mostUsedLanguages, record) => {
    const languages = record.workedItLanguages.split(';')

    languages.forEach(language => {
      const foundLanguage = mostUsedLanguages.find(d => d.language === language)
      if (foundLanguage) return foundLanguage.count++

      mostUsedLanguages.push({
        language,
        count: 1
      })
    })

    return mostUsedLanguages
  }, [])
}

const getMostDesiredLanguages = rawData => {
  return rawData.reduce((mostDesiredLanguages, record) => {
    const languages = record.wantToWorkLanguages.split(';')

    languages.forEach(language => {
      const foundLanguage = mostDesiredLanguages.find(d => d.language === language)
      if (foundLanguage) return foundLanguage.count++

      mostDesiredLanguages.push({
        language,
        count: 1
      })
    })

    return mostDesiredLanguages
  }, [])
}

const getMostUsedDatabasesByCountries = rawData => {
  return rawData.reduce((mostUsedDatabases, record) => {
    const databases = record.wantToWorkDatabases.split(';')
    const country = record.country

    databases.forEach(db => {
      const foundDatabase = mostUsedDatabases.find(d => d.database === db)
      if (foundDatabase) return foundDatabase[country] = (foundDatabase[country] || 0) + 1

      mostUsedDatabases.push({
        database: db,
        [country]: 1,
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
    'workedItLanguages': {
      index: 16
    },
    'wantToWorkLanguages': {
      index: 17
    },
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
    'workedItLanguages': {
      index: 22
    },
    'wantToWorkLanguages': {
      index: 21
    },
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
    'workedItLanguages': {
      index: 43
    },
    'wantToWorkLanguages': {
      index: 44
    },
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
    'workedItLanguages': {
      index: 65
    },
    'wantToWorkLanguages': {
      index: 66
    },
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
    mostUsedDatabasesByCountries: getMostUsedDatabasesByCountries(records),
    mostDesiredLanguages: getMostDesiredLanguages(records),
    mostUsedLanguages: getMostUsedLanguages(records),
  }
}

const setCache = (key, value) => cacheService.set(key, value)
const getCache = key => cacheService.get(key)

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
    await setCache(analyze.year, analyze)
  }))
}

module.exports = {
  analyzeAllDisponibleYears: async (refresh) => {
    if (refresh) {
      const analyzes = await makeAnalyzes(validYears)
      await cacheAnalyzes(analyzes)
      return analyzes
    }

    const pendingAnalyzes = await getPendingAnalyzes()
    const cachedAnalyzes = await getCachedAnalyzes()
    const analyzes = await makeAnalyzes(pendingAnalyzes)
    await cacheAnalyzes(analyzes)
    return [...analyzes, ...cachedAnalyzes]
  },
  analyze: async (year, refresh) => {
    const cachedAnalyze = await getCache(year)

    if (cachedAnalyze && !refresh)
      return Promise.resolve(cachedAnalyze)

    return read(year)
      .then(analyze)
      .then(analyze => {
        setCache(year, analyze)
        return analyze
      })
  }
}