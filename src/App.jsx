import React, { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_API_KEY
const API_URL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=35.7796&lon=-78.6382&key=${API_KEY}`

function App() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('')
  const [minTemp, setMinTemp] = useState(null)
  const [moonRise, setMoonRise] = useState(null)
  const [moonPhase, setMoonPhase] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(API_URL)
      const json = await response.json()
      console.log('API response:', json)
      if (!json.data) {
        alert(json.error || 'No data returned from API')
        return
      }
      const samplePhases = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘']
      const enriched = json.data.map((item, i) => ({
        ...item,
        temp: item.temp, // or item.high_temp, item.low_temp, etc.
        moon_phase: samplePhases[i % samplePhases.length],
        moonrise: fakeTime(6 + i),
        moonset: fakeTime(19 + i),
      }))
      setData(enriched)
      setMinTemp(Math.min(...enriched.map(e => e.temp)))
      setMoonRise(enriched[0].moonrise)
      setMoonPhase(enriched[0].moon_phase)
    }
    fetchData()
  }, [])

  const fakeTime = hour => {
    const h = String(hour % 24).padStart(2, '0')
    const m = String((hour * 3) % 60).padStart(2, '0')
    const s = String((hour * 7) % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const filtered = data.filter(item => {
    return (
      item.datetime.includes(search) &&
      (phaseFilter === '' || item.moon_phase === phaseFilter)
    )
  })

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>🌌 AstroDash</h1>
        <nav>
          <p>🏠 Dashboard</p>
          <p>🔍 Search</p>
          <p>ℹ️ About</p>
        </nav>
      </aside>

      <main className="dashboard">
        <div className="cards">
          <div className="card">🌡️<br />{minTemp}°F<br /><small>Low Temp</small></div>
          <div className="card">🌙<br />{moonRise}<br /><small>Moon Rise</small></div>
          <div className="card">🪐<br />{moonPhase}<br /><small>Moon Phase</small></div>
        </div>

        <div className="controls">
          <input
            type="text"
            placeholder="Enter Date"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)}>
            <option value="">All Phases</option>
            {Array.from(new Set(data.map(e => e.moon_phase))).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Temperature</th>
              <th>Moon Rise</th>
              <th>Moon Set</th>
              <th>Moon Phase</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={idx}>
                <td>{item.datetime}</td>
                <td>{item.temp}°F</td>
                <td>{item.moonrise}</td>
                <td>{item.moonset}</td>
                <td>{item.moon_phase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}

export default App
