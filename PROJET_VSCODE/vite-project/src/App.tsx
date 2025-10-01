import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import toast, { Toaster } from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

// Base d'URL de l'API dynamique pour réseau local (PC_IP:8000)
const API = `http://${window.location.hostname}:8000`

interface CountResponse {
  count: number;
}

interface CountIncrementResponse {
  count: number;
  message: string;
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

function App() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<CountHistoryItem[]>([])
  const [darkMode, setDarkMode] = useState(true)
  const [customIncrement, setCustomIncrement] = useState(1)
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error'}>>([])
  
  // États pour les nouvelles fonctionnalités
  const [gameMode, setGameMode] = useState(false)
  const [gameTime, setGameTime] = useState(30)
  const [gameScore, setGameScore] = useState(0)
  const [gameLevel, setGameLevel] = useState(1)
  const [gameActive, setGameActive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [exportData, setExportData] = useState<any>(null)
  const [checkpoints, setCheckpoints] = useState<Array<{id: number, count: number, timestamp: string, name: string}>>([])
  const [showCharts, setShowCharts] = useState(false)
  const [chartData, setChartData] = useState<any>(null)
  
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Fonction pour jouer des sons
  const playSound = (frequency: number, duration: number = 200) => {
    if (!soundsEnabled) return
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000)
    } catch (error) {
      console.log('Audio not supported')
    }
  }

  // Fonction pour ajouter une notification
  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

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

  // Fonction pour calculer les statistiques
  const getStatistics = () => {
    if (history.length === 0) return { totalActions: 0, averageValue: 0, incrementCount: 0, resetCount: 0 }
    
    const incrementActions = history.filter(h => h.action === 'increment')
    const resetActions = history.filter(h => h.action === 'reset')
    const averageValue = history.reduce((sum, h) => sum + h.count_value, 0) / history.length
    
    return {
      totalActions: history.length,
      averageValue: Math.round(averageValue * 100) / 100,
      incrementCount: incrementActions.length,
      resetCount: resetActions.length
    }
  }

  // Fonctions de jeu
  const startGame = () => {
    setGameActive(true)
    setGameScore(0)
    setGameTime(30)
    playSound(440, 300)
    toast.success('Jeu démarré ! Cliquez le plus vite possible !')
    
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
    
    // Calculer le niveau
    const newLevel = Math.floor(gameScore / 10) + 1
    setGameLevel(newLevel)
    
    // Confettis si bon score
    if (gameScore > 20) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      playSound(880, 500)
      toast.success(`Excellent ! Niveau ${newLevel} atteint !`)
    } else {
      playSound(220, 500)
      toast('Jeu terminé ! Continuez à vous entraîner !')
    }
  }

  const gameIncrement = () => {
    if (!gameActive) return
    
    setGameScore(prev => prev + 1)
    playSound(660, 100)
    
    // Augmenter la difficulté
    if (gameScore > 0 && gameScore % 10 === 0) {
      playSound(880, 200)
      toast.success(`Niveau ${Math.floor(gameScore / 10) + 1} !`)
    }
  }

  // Fonctions de sauvegarde et export
  const saveCheckpoint = (name: string) => {
    const checkpoint = {
      id: Date.now(),
      count,
      timestamp: new Date().toISOString(),
      name
    }
    setCheckpoints(prev => [...prev, checkpoint])
    toast.success(`Point de contrôle "${name}" sauvegardé !`)
    playSound(523, 200)
  }

  const loadCheckpoint = (checkpoint: any) => {
    setCount(checkpoint.count)
    toast.success(`Point de contrôle "${checkpoint.name}" chargé !`)
    playSound(659, 200)
  }

  const exportToJSON = () => {
    const data = {
      count,
      history,
      checkpoints,
      statistics: getStatistics(),
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compteur-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Données exportées !')
    playSound(523, 200)
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Action', 'Valeur', 'Timestamp'],
      ...history.map(h => [h.action, h.count_value, h.timestamp])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compteur-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Historique exporté en CSV !')
    playSound(523, 200)
  }

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
        const data: CountIncrementResponse = await response.json()
        setCount(data.count)
        fetchHistory() // Rafraîchir l'historique
        addNotification(`Compteur incrémenté à ${data.count}`, 'success')
        playSound(440, 150)
        
        // Confettis pour les paliers
        if (data.count % 10 === 0 && data.count > 0) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          toast.success(`🎉 Palier ${data.count} atteint !`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error)
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
        fetchHistory() // Rafraîchir l'historique
        addNotification(`Compteur réinitialisé à ${data.count}`, 'success')
        playSound(220, 300)
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du compteur:', error)
      addNotification('Erreur lors de la réinitialisation', 'error')
      playSound(110, 500)
    } finally {
      setLoading(false)
    }
  }

  // Charger la valeur initiale du compteur et l'historique au montage du composant
  useEffect(() => {
    fetchCount()
    fetchHistory()
  }, [])

  const stats = getStatistics()

  // Préparer les données pour les graphiques
  useEffect(() => {
    if (history.length > 0) {
      const labels = history.slice(-20).map((_, index) => index + 1)
      const values = history.slice(-20).map(h => h.count_value)
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Valeur du compteur',
            data: values,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          }
        ]
      })
    }
  }, [history])

  return (
    <div style={{ 
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', 
      color: darkMode ? '#ffffff' : '#1a1a1a',
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      {/* Confettis */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Toaster pour les notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#333',
          },
        }}
      />

      {/* Notifications personnalisées */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        {notifications.map(notification => (
          <motion.div 
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{
              backgroundColor: notification.type === 'success' ? '#4CAF50' : '#f44336',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '5px',
              marginBottom: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            {notification.message}
          </motion.div>
        ))}
      </div>

      {/* Header avec tous les contrôles */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px',
        borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
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
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <button 
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            style={{
              backgroundColor: soundsEnabled ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {soundsEnabled ? '🔊' : '🔇'}
          </button>
          
          <button 
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            style={{
              backgroundColor: animationsEnabled ? '#2196F3' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {animationsEnabled ? '✨' : '🚫'}
          </button>
          
          <button 
            onClick={() => setShowCharts(!showCharts)}
            style={{
              backgroundColor: showCharts ? '#FF9800' : '#666',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📊
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
            🎮
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Atelier IA Générative</h1>
        
        {/* Section Jeu */}
        {gameMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ 
              backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
              marginBottom: '20px',
              border: '2px solid #E91E63'
            }}
          >
            <h3>🎮 Mode Jeu - Cliquez le plus vite possible !</h3>
            
            {!gameActive ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Niveau actuel : {gameLevel}</strong>
                </div>
                <button 
                  onClick={startGame}
                  style={{
                    backgroundColor: '#E91E63',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
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
                  <div>⏰ Temps restant : <strong style={{ color: '#E91E63' }}>{gameTime}s</strong></div>
                  <div>🎯 Score : <strong style={{ color: '#4CAF50' }}>{gameScore}</strong></div>
                  <div>📈 Niveau : <strong style={{ color: '#2196F3' }}>{Math.floor(gameScore / 10) + 1}</strong></div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={gameIncrement}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '20px 40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  🎯
                </motion.button>
                
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={endGame}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Arrêter le jeu
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Section Graphiques */}
        {showCharts && chartData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ 
              backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
              marginBottom: '20px'
            }}
          >
            <h3>📊 Graphiques en temps réel</h3>
            <div style={{ height: '300px' }}>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: darkMode ? '#fff' : '#333'
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: darkMode ? '#fff' : '#333'
                      },
                      grid: {
                        color: darkMode ? '#444' : '#ddd'
                      }
                    },
                    y: {
                      ticks: {
                        color: darkMode ? '#fff' : '#333'
                      },
                      grid: {
                        color: darkMode ? '#444' : '#ddd'
                      }
                    }
                  }
                }} 
              />
            </div>
          </motion.div>
        )}

        {/* Section Statistiques */}
        <div className="card" style={{ 
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          marginBottom: '20px'
        }}>
          <h3>📊 Statistiques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#333' : '#fff', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.totalActions}</div>
              <div>Total Actions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#333' : '#fff', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{stats.averageValue}</div>
              <div>Moyenne</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#333' : '#fff', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.incrementCount}</div>
              <div>Incréments</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: darkMode ? '#333' : '#fff', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>{stats.resetCount}</div>
              <div>Resets</div>
            </div>
          </div>
        </div>

        {/* Section Contrôles */}
        <div className="card" style={{ 
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          marginBottom: '20px'
        }}>
          <h3>🎮 Contrôles du Compteur</h3>
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            <motion.div
              key={count}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}
            >
              🎯 {count}
            </motion.div>
          </div>
          
          {/* Contrôle d'incrément personnalisé */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Incrément personnalisé :
            </label>
            <input 
              type="number" 
              value={customIncrement} 
              onChange={(e) => setCustomIncrement(parseInt(e.target.value) || 1)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                backgroundColor: darkMode ? '#333' : '#fff',
                color: darkMode ? '#fff' : '#333',
                marginRight: '10px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={incrementCount} 
              disabled={loading}
              style={{ 
                opacity: loading ? 0.6 : 1,
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Incrémentation...' : '➕ Incrémenter (+1)'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetCount} 
              disabled={loading}
              style={{ 
                opacity: loading ? 0.6 : 1, 
                backgroundColor: '#ff4444', 
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🔄 Réinitialiser
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                for(let i = 0; i < customIncrement; i++) {
                  setTimeout(() => incrementCount(), i * 100)
                }
              }}
              disabled={loading}
              style={{ 
                opacity: loading ? 0.6 : 1, 
                backgroundColor: '#FF9800', 
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🚀 Incrémenter (+{customIncrement})
            </motion.button>
          </div>
        </div>

        {/* Section Points de contrôle */}
        <div className="card" style={{ 
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          marginBottom: '20px'
        }}>
          <h3>💾 Points de contrôle</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Nom du point de contrôle"
              id="checkpointName"
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                backgroundColor: darkMode ? '#333' : '#fff',
                color: darkMode ? '#fff' : '#333',
                marginRight: '10px',
                width: '200px'
              }}
            />
            <button 
              onClick={() => {
                const input = document.getElementById('checkpointName') as HTMLInputElement
                if (input.value.trim()) {
                  saveCheckpoint(input.value.trim())
                  input.value = ''
                }
              }}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💾 Sauvegarder
            </button>
          </div>
          
          {checkpoints.length > 0 && (
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
              borderRadius: '5px',
              padding: '10px'
            }}>
              {checkpoints.map((checkpoint) => (
                <div key={checkpoint.id} style={{
                  padding: '8px',
                  borderBottom: `1px solid ${darkMode ? '#444' : '#eee'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    📌 {checkpoint.name} (valeur: {checkpoint.count})
                  </span>
                  <div>
                    <button 
                      onClick={() => loadCheckpoint(checkpoint)}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginRight: '5px',
                        fontSize: '12px'
                      }}
                    >
                      🔄 Charger
                    </button>
                    <button 
                      onClick={() => setCheckpoints(prev => prev.filter(c => c.id !== checkpoint.id))}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Export */}
        <div className="card" style={{ 
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          marginBottom: '20px'
        }}>
          <h3>📤 Export des données</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={exportToJSON}
              style={{
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📄 Export JSON
            </button>
            <button 
              onClick={exportToCSV}
              style={{
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      
        {/* Section Historique */}
        <div className="card" style={{ 
          backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
          marginBottom: '20px'
        }}>
          <h3>📜 Historique des actions</h3>
          {history.length === 0 ? (
            <p>Aucune action enregistrée</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <AnimatePresence>
                {history.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ 
                      padding: '12px', 
                      margin: '8px 0', 
                      backgroundColor: darkMode ? '#333' : '#fff', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: item.action === 'increment' ? '#4CAF50' : '#f44336' }}>
                          {item.action === 'increment' ? '➕ Incrément' : '🔄 Reset'}
                        </strong>
                        <span style={{ marginLeft: '10px' }}>Valeur: <strong>{item.count_value}</strong></span>
                      </div>
                      <div style={{ fontSize: '12px', color: darkMode ? '#aaa' : '#666' }}>
                        {new Date(item.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <p style={{ textAlign: 'center', color: darkMode ? '#aaa' : '#666' }}>
          🚀 Développé avec l'IA générative et Continue.dev
        </p>
      </div>
    </div>
  )
}

export default App
