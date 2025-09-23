import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Welcome } from './pages/Welcome'
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
