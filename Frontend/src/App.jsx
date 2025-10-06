import './App.css'
import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingCard from './components/LoadingCard'
import { CustomerProvider } from './context/CustomerContext'   // import provider
import AuthProvider from './context/AuthProvider.jsx';
import AddCustomerPage from './pages/AddCustomerPage.jsx'
import Layout from './layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx'
import AddAccount from './pages/AddAccount.jsx'
import UpdateCustomerPage from './pages/UpdateCustomerPage.jsx'
import AuthCallback from './context/AuthCallback.jsx';

// Lazy load components for code splitting

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
          <Route path="/auth/callback" element={<AuthCallback />} />

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
          <Route
            path="/dashboard"
            element={
              <CustomerProvider>
                <Layout >
                <Dashboard/>
                </Layout>
              </CustomerProvider>
            }
          />
          <Route
            path="/add-account"
            element={
              <CustomerProvider>
                <Layout >
                <AddAccount/>
                </Layout>
              </CustomerProvider>
            }
          />
          <Route
            path="/update-customer"
            element={
              <CustomerProvider>
                <Layout >
                <UpdateCustomerPage/>
                </Layout>
              </CustomerProvider>
            }

          />
<Route path='*' element={<div className='text-center mt-20 text-3xl font-bold'>404 Not Found</div>} />
        </Routes>
        
      </Suspense>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
