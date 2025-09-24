import './App.css'
import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingCard from './components/LoadingCard'
import { CustomerProvider } from './context/CustomerContext'   // import provider

const Welcome = lazy(() => import('./pages/Welcome'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const CustomerPage = lazy(() => import('./pages/CustomerPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingCard/>}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Wrap only this route in CustomerProvider */}
          <Route
            path="/customer"
            element={
              <CustomerProvider>
                <CustomerPage />
              </CustomerProvider>
            }
          />
        </Routes>
        
      </Suspense>
    </BrowserRouter>
  )
}

export default App
