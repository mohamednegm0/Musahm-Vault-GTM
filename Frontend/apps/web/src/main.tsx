import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { ConfirmProvider } from './contexts/ConfirmContext'
import { PostHogProvider } from '@posthog/react'
import './main.css'

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
  session_recording: {
    maskAllInputs: false,
  },
  capture_pageview: false,
} as const

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <LanguageProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </LanguageProvider>
    </PostHogProvider>
  </React.StrictMode>
)
