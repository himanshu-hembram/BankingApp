import './App.css'
import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingCard from './components/LoadingCard'
import { CustomerProvider } from './context/CustomerContext'   // import provider
import AuthProvider from './context/AuthProvider.jsx';
import AddCustomerPage from './pages/AddCustomerPage.jsx'
import Layout from './layout/Layout.jsx';
import AddAccount from './pages/AddAccount.jsx'

const Welcome = lazy(() => import('./pages/Welcome'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const CustomerPage = lazy(() => import('./pages/CustomerPage'))

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<LoadingCard/>}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}

          {/* Wrap only this route in CustomerProvider */}
          <Route
            path="/customer"
            element={
              <CustomerProvider>
                <Layout >
                <AddCustomerPage />
                </Layout>
              </CustomerProvider>
            }
          />


        </Routes>
        
      </Suspense>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
