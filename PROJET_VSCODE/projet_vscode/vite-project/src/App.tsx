import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface CountResponse {
  count: number;
}

interface CountIncrementResponse {
  count: number;
  message: string;
}

function App() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fonction pour récupérer la valeur du compteur depuis l'API
  const fetchCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/count')
      if (response.ok) {
        const data: CountResponse = await response.json()
        setCount(data.count)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur:', error)
    }
  }

  // Fonction pour incrémenter le compteur via l'API
  const incrementCount = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/count/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data: CountIncrementResponse = await response.json()
        setCount(data.count)
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger la valeur initiale du compteur au montage du composant
  useEffect(() => {
    fetchCount()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Atelier IA Générative</h1>
      <div className="card">
        <button 
          onClick={incrementCount} 
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Incrémentation...' : `count is ${count}`}
        </button>
        <p>
          Le compteur est synchronisé avec la base de données PostgreSQL via FastAPI
        </p>
      </div>
      <p className="read-the-docs">
        Développé avec l'IA générative et Continue.dev
      </p>
    </>
  )
}

export default App
