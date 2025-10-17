import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import toast, { Toaster } from 'react-hot-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const API = `http://${window.location.hostname}:8000`

interface CountResponse {
  count: number;
}

interface CountHistoryItem {
  id: number;
  count_value: number;
  action: string;
  timestamp: string;
}

interface CountHistoryResponse {
  history: CountHistoryItem[];
}

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut'

function App() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<CountHistoryItem[]>([])
  const [darkMode, setDarkMode] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [chartType, setChartType] = useState<ChartType>('line')
  const [customValue, setCustomValue] = useState(1)

  // Mode Jeu
  const [gameMode, setGameMode] = useState(false)
  const [gameTime, setGameTime] = useState(30)
  const [gameScore, setGameScore] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour récupérer la valeur du compteur depuis l'API
  const fetchCount = async () => {
    try {
      const response = await fetch(`${API}/count`)
      if (response.ok) {
        const data: CountResponse = await response.json()
        setCount(data.count)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur:', error)
      toast.error('Erreur de connexion au backend')
    }
  }

  // Fonction pour récupérer l'historique
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API}/count/history`)
      if (response.ok) {
        const data: CountHistoryResponse = await response.json()
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
    }
  }

  // Charger la valeur initiale du compteur et l'historique au montage du composant
  useEffect(() => {
    fetchCount()
    fetchHistory()
  }, [])

  // Fonction pour incrémenter le compteur via l'API
  const incrementCount = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/count/increment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data: CountResponse = await response.json()
        setCount(data.count)
        fetchHistory()
        toast.success(`Compteur incrémenté à ${data.count}`)

        // Confettis pour les paliers de 10
        if (data.count % 10 === 0 && data.count > 0) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          toast.success(`🎉 Palier ${data.count} atteint !`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error)
      toast.error('Erreur lors de l\'incrémentation')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour décrémenter le compteur
  const decrementCount = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/count/decrement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data: CountResponse = await response.json()
        setCount(data.count)
        fetchHistory()
        toast.success(`Compteur décrémenté à ${data.count}`)
      }
    } catch (error) {
      console.error('Erreur lors de la décrémentation du compteur:', error)
      toast.error('Erreur lors de la décrémentation')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour incrémentation personnalisée
  const customIncrement = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/count/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: customValue })
      })
      if (response.ok) {
        const data: CountResponse = await response.json()
        setCount(data.count)
        fetchHistory()
        toast.success(`Compteur modifié de ${customValue > 0 ? '+' : ''}${customValue}`)
      }
    } catch (error) {
      console.error('Erreur lors de la modification du compteur:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour réinitialiser le compteur via l'API
  const resetCount = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/count/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data: CountResponse = await response.json()
        setCount(data.count)
        fetchHistory()
        toast.success('Compteur réinitialisé')
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du compteur:', error)
      toast.error('Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  // Fonctions Mode Jeu
  const startGame = () => {
    setGameActive(true)
    setGameScore(0)
    setGameTime(30)
    toast.success('🎮 Jeu démarré ! Clique le plus vite possible !')

    gameTimerRef.current = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const endGame = () => {
    setGameActive(false)
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
    }

    // Confettis si bon score
    if (gameScore > 20) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      toast.success(`🏆 Excellent score : ${gameScore} clics !`)
    } else {
      toast(`⏱️ Jeu terminé ! Score : ${gameScore} clics`)
    }
  }

  const gameClick = () => {
    if (!gameActive) return
    setGameScore(prev => prev + 1)
  }

  // Fonction Export JSON
  const exportToJSON = () => {
    const data = {
      count,
      history,
      stats: getStats(),
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compteur-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('📥 Données exportées en JSON !')
  }

  // Fonction Export CSV
  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Action', 'Valeur', 'Timestamp'],
      ...history.map(h => [h.id, h.action, h.count_value, h.timestamp])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compteur-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('📊 Historique exporté en CSV !')
  }

  // Calculer les statistiques
  const getStats = () => ({
    totalActions: history.length,
    incrementCount: history.filter(h => h.action.includes('increment')).length,
    decrementCount: history.filter(h => h.action.includes('decrement')).length,
    resetCount: history.filter(h => h.action === 'reset').length,
  })

  const stats = getStats()

  // Données pour les graphiques
  const getChartData = () => {
    const last20 = history.slice(-20).reverse()

    // Graphique Ligne/Barres - Évolution
    const lineBarData = {
      labels: last20.map((_, index) => `${index + 1}`),
      datasets: [
        {
          label: 'Valeur du compteur',
          data: last20.map(h => h.count_value),
          borderColor: '#4CAF50',
          backgroundColor: chartType === 'bar' ? '#4CAF50' : 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }
      ]
    }

    // Graphique Circulaire - Types d'actions
    const pieData = {
      labels: ['Incréments', 'Décréments', 'Resets'],
      datasets: [
        {
          label: 'Actions',
          data: [stats.incrementCount, stats.decrementCount, stats.resetCount],
          backgroundColor: [
            '#4CAF50',
            '#FF9800',
            '#f44336',
          ],
          borderColor: [
            '#4CAF50',
            '#FF9800',
            '#f44336',
          ],
          borderWidth: 2
        }
      ]
    }

    return chartType === 'pie' || chartType === 'doughnut' ? pieData : lineBarData
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#fff' : '#333'
        }
      },
      title: {
        display: true,
        text: chartType === 'line' ? 'Évolution du compteur (ligne)' :
              chartType === 'bar' ? 'Évolution du compteur (barres)' :
              chartType === 'pie' ? 'Répartition des actions (camembert)' :
              'Répartition des actions (donut)',
        color: darkMode ? '#fff' : '#333',
        font: {
          size: 16
        }
      }
    },
    scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
      x: {
        ticks: { color: darkMode ? '#fff' : '#333' },
        grid: { color: darkMode ? '#444' : '#ddd' }
      },
      y: {
        ticks: { color: darkMode ? '#fff' : '#333' },
        grid: { color: darkMode ? '#444' : '#ddd' }
      }
    }
  }

  const renderChart = () => {
    const data = getChartData()

    switch (chartType) {
      case 'line':
        return <Line data={data} options={chartOptions} />
      case 'bar':
        return <Bar data={data} options={chartOptions} />
      case 'pie':
        return <Pie data={data} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />
      default:
        return <Line data={data} options={chartOptions} />
    }
  }

  return (
    <div style={{
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#1a1a1a',
      minHeight: '100vh',
      transition: 'all 0.3s ease',
      padding: '20px'
    }}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#333',
          },
        }}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              backgroundColor: darkMode ? '#333' : '#f0f0f0',
              color: darkMode ? '#fff' : '#333',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {darkMode ? '☀️ Clair' : '🌙 Sombre'}
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              backgroundColor: showHistory ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📜 Historique
          </button>

          <button
            onClick={() => setShowChart(!showChart)}
            style={{
              backgroundColor: showChart ? '#2196F3' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📊 Graphiques
          </button>

          <button
            onClick={() => setGameMode(!gameMode)}
            style={{
              backgroundColor: gameMode ? '#E91E63' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🎮 Mode Jeu
          </button>

          <button
            onClick={exportToJSON}
            style={{
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📥 JSON
          </button>

          <button
            onClick={exportToCSV}
            style={{
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📊 CSV
          </button>
        </div>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Atelier Coder avec IA
      </h1>

      {/* Mode Jeu */}
      <AnimatePresence>
        {gameMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '3px solid #E91E63'
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#E91E63' }}>
              🎮 Mode Jeu - Clic Rapide
            </h2>

            {!gameActive ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '20px' }}>
                  Clique le plus vite possible pendant 30 secondes !
                </p>
                <button
                  onClick={startGame}
                  style={{
                    backgroundColor: '#E91E63',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  🚀 Démarrer le jeu !
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '20px' }}>
                  <div>⏰ Temps : <strong style={{ color: '#E91E63' }}>{gameTime}s</strong></div>
                  <div>🎯 Score : <strong style={{ color: '#4CAF50' }}>{gameScore}</strong></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={gameClick}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '30px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '48px',
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  🎯
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          borderRadius: '10px',
          border: `2px solid ${darkMode ? '#333' : '#eee'}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.totalActions}</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Total</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          borderRadius: '10px',
          border: `2px solid ${darkMode ? '#333' : '#eee'}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>{stats.incrementCount}</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Incréments</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          borderRadius: '10px',
          border: `2px solid ${darkMode ? '#333' : '#eee'}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>{stats.decrementCount}</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Décréments</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          borderRadius: '10px',
          border: `2px solid ${darkMode ? '#333' : '#eee'}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>{stats.resetCount}</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Resets</div>
        </div>
      </div>

      {/* Section Contrôles */}
      <div style={{
        backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        border: `2px solid ${darkMode ? '#333' : '#eee'}`
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>🎮 Contrôles du Compteur</h3>

        <motion.div
          key={count}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#4CAF50',
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >
          🎯 {count}
        </motion.div>

        {/* Contrôles de base */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={incrementCount}
            disabled={loading}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳' : '➕ +1'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={decrementCount}
            disabled={loading}
            style={{
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            ➖ -1
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetCount}
            disabled={loading}
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔄 Reset
          </motion.button>
        </div>

        {/* Incrémentation personnalisée */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          paddingTop: '20px',
          borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`
        }}>
          <label style={{ fontSize: '14px' }}>Valeur personnalisée :</label>
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(parseInt(e.target.value) || 0)}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              backgroundColor: darkMode ? '#333' : '#fff',
              color: darkMode ? '#fff' : '#333',
              width: '100px',
              fontSize: '16px'
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={customIncrement}
            disabled={loading}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            🚀 Appliquer ({customValue > 0 ? '+' : ''}{customValue})
          </motion.button>
        </div>
      </div>

      {/* Graphiques */}
      <AnimatePresence>
        {showChart && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: `2px solid ${darkMode ? '#333' : '#eee'}`
            }}
          >
            <h3 style={{ marginBottom: '20px' }}>📊 Visualisations des Données</h3>

            {/* Sélecteur de type de graphique */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setChartType('line')}
                style={{
                  backgroundColor: chartType === 'line' ? '#2196F3' : darkMode ? '#444' : '#ddd',
                  color: chartType === 'line' ? 'white' : darkMode ? '#fff' : '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: chartType === 'line' ? 'bold' : 'normal'
                }}
              >
                📈 Ligne
              </button>
              <button
                onClick={() => setChartType('bar')}
                style={{
                  backgroundColor: chartType === 'bar' ? '#4CAF50' : darkMode ? '#444' : '#ddd',
                  color: chartType === 'bar' ? 'white' : darkMode ? '#fff' : '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: chartType === 'bar' ? 'bold' : 'normal'
                }}
              >
                📊 Barres
              </button>
              <button
                onClick={() => setChartType('pie')}
                style={{
                  backgroundColor: chartType === 'pie' ? '#FF9800' : darkMode ? '#444' : '#ddd',
                  color: chartType === 'pie' ? 'white' : darkMode ? '#fff' : '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: chartType === 'pie' ? 'bold' : 'normal'
                }}
              >
                🥧 Camembert
              </button>
              <button
                onClick={() => setChartType('doughnut')}
                style={{
                  backgroundColor: chartType === 'doughnut' ? '#E91E63' : darkMode ? '#444' : '#ddd',
                  color: chartType === 'doughnut' ? 'white' : darkMode ? '#fff' : '#333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: chartType === 'doughnut' ? 'bold' : 'normal'
                }}
              >
                🍩 Donut
              </button>
            </div>

            <div style={{ height: '400px' }}>
              {renderChart()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historique */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
              padding: '30px',
              borderRadius: '15px',
              border: `2px solid ${darkMode ? '#333' : '#eee'}`
            }}
          >
            <h3 style={{ marginBottom: '20px' }}>📜 Historique des Actions</h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
              borderRadius: '8px',
              padding: '10px'
            }}>
              {history.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Aucune action enregistrée</p>
              ) : (
                history.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      borderBottom: index < history.length - 1 ? `1px solid ${darkMode ? '#444' : '#eee'}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      {item.action.includes('increment') ? '➕' : item.action.includes('decrement') ? '➖' : '🔄'}
                      {' '}{item.action.replace('_', ' ')}
                      {' '}→ <strong>{item.count_value}</strong>
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(item.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
