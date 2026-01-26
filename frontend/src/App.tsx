import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-slate-900 to-black text-white">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Tasque Manager
        </h1>
        <p className="text-slate-300 text-lg">
          A modern task management system built with Spring Boot and React.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-medium">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-xl border border-slate-600 hover:bg-slate-800 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}