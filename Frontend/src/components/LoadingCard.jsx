import React from 'react'
import { ClipLoader } from 'react-spinners'

const LoadingCard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/6 flex flex-col items-center gap-6">
          <div className="p-4 rounded-full bg-white/5 flex items-center justify-center">
            <ClipLoader color="#49a6ff" size={40} />
          </div>

          <div className="w-48 h-3 bg-white/8 rounded-full animate-pulse" />

          <div className="text-sky-100">Loading, please wait...</div>
        </div>
      </div>
    </div>
  )
}

export default LoadingCard
