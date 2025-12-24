import './App.css'
import Header from './components/Header'
import HomePage from './pages/Home'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
      <Header />
      <main>
        <Outlet /> 
      </main>
    </>
  )
}

export default App
