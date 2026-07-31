import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './pages/growth/growthTheme.css'
import { hydrateAll } from './lib/dbSync'

// Pull any Supabase-persisted state into localStorage first (no-op when Supabase
// is disabled or offline), then render — so the first paint has synced data.
hydrateAll().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
})
