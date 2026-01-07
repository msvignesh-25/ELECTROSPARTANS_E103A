import { useState } from 'react'
import Logo from './components/Logo'
import ThemeToggle from './components/ThemeToggle'
import HowItWorks from './components/HowItWorks'
import HeroSection from './components/HeroSection'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-200 dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Center - Company Name */}
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SoftSell
              </h1>
            </div>

            {/* Right - Buttons */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Auth Buttons */}
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Log in
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm w-full max-w-md">
              <div className="text-center">
                <button
                  className="btn btn-primary"
                  onClick={() => setCount((count) => count + 1)}
                >
                  Count is {count}
                </button>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Edit <code className="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 rounded">src/app.jsx</code> and save to test HMR
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Tailwind CSS is working if this page is styled!
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 