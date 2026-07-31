import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ModulesPage from './pages/ModulesPage'

// Competition
import CompetitorListPage from './pages/competition/CompetitorListPage'
import CompetitorDetailPage from './pages/competition/CompetitorDetailPage'
import SignalFeedPage from './pages/competition/SignalFeedPage'
import StrategicRadarPage from './pages/competition/StrategicRadarPage'

// Delivery Health (revamped to match the production reference)
import DashboardPage from './pages/delivery-health/DashboardPage'
import ProjectsPage from './pages/delivery-health/ProjectsPage'
import AccountsHealthPage from './pages/delivery-health/AccountsHealthPage'
import ProjectDetailPage from './pages/delivery-health/ProjectDetailPage'
import InterventionsPage from './pages/delivery-health/InterventionsPage'

// Growth
import ExecutiveSummaryPage from './pages/growth/ExecutiveSummaryPage'
import PipelineInsightsPage from './pages/growth/PipelineInsightsPage'
import FinancialInsightsPage from './pages/growth/FinancialInsightsPage'
import ArticlePage from './pages/growth/ArticlePage'
import NewsArticlePage from './pages/growth/NewsArticlePage'

// Marketing
import ExecutiveAiSummaryPage from './pages/marketing/ExecutiveAiSummaryPage'
import MarketPulsePage from './pages/marketing/MarketPulsePage'
import InsideIndegenePage from './pages/marketing/InsideIndegenePage'
import AccountPulsePage from './pages/marketing/AccountPulsePage'
import NextBestActionPage from './pages/marketing/NextBestActionPage'
import ExecutionWorkspacePage from './pages/marketing/ExecutionWorkspacePage'

// Accounts (cross-module)
import AccountsListPage from './pages/accounts/AccountsListPage'
import ConsolidatedAccountPage from './pages/accounts/ConsolidatedAccountPage'
import AccountReportPage from './pages/accounts/AccountReportPage'
import AccountInfoPage from './pages/accounts/AccountInfoPage'
import AccountPlanningPage from './pages/accounts/AccountPlanningPage'
import ExecCapitalPage from './pages/accounts/ExecCapitalPage'
import ExecDetailPage from './pages/accounts/ExecDetailPage'
import ExecutiveBriefingPresentation from './pages/accounts/ExecutiveBriefingPresentation'
import ConsolidatedPage from './pages/accounts/ConsolidatedPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/briefing/:accountId" element={<ExecutiveBriefingPresentation />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={<ModulesPage />} />

          {/* Competition */}
          <Route path="/competition" element={<CompetitorListPage />} />
          <Route path="/competition/signals" element={<SignalFeedPage />} />
          <Route path="/competition/radar" element={<StrategicRadarPage />} />
          <Route path="/competition/:competitorId" element={<CompetitorDetailPage />} />

          {/* Delivery Health — Dashboard / Projects / Account Health / Interventions */}
          <Route path="/delivery-health" element={<DashboardPage />} />
          <Route path="/delivery-health/projects" element={<ProjectsPage />} />
          <Route path="/delivery-health/accounts" element={<AccountsHealthPage />} />
          <Route path="/delivery-health/actions" element={<InterventionsPage />} />
          <Route path="/delivery-health/engagement/:id" element={<ProjectDetailPage />} />
          {/* legacy paths → redirect to the new structure */}
          <Route path="/delivery-health/milestones" element={<Navigate to="/delivery-health" replace />} />
          <Route path="/delivery-health/risks" element={<Navigate to="/delivery-health/projects" replace />} />
          <Route path="/delivery-health/resourcing" element={<Navigate to="/delivery-health/accounts" replace />} />
          <Route path="/delivery-health/sla" element={<Navigate to="/delivery-health/projects" replace />} />

          {/* Growth — Sales & Growth module (Internal News / External News + account sections) */}
          <Route path="/executive-summary" element={<ExecutiveSummaryPage section="internal" />} />
          <Route path="/executive-summary/external-news" element={<ExecutiveSummaryPage section="external" />} />
          <Route path="/executive-summary/pipeline-insights" element={<PipelineInsightsPage />} />
          <Route path="/executive-summary/financial-insights" element={<FinancialInsightsPage />} />
          <Route path="/executive-summary/article/:type" element={<ArticlePage />} />
          <Route path="/executive-summary/news/:id" element={<NewsArticlePage />} />

          {/* Marketing */}
          <Route path="/marketing" element={<ExecutiveAiSummaryPage />} />
          <Route path="/marketing/market-pulse" element={<MarketPulsePage />} />
          <Route path="/marketing/inside-indegene" element={<InsideIndegenePage />} />
          <Route path="/marketing/account-pulse" element={<AccountPulsePage />} />
          <Route path="/marketing/next-best-action" element={<NextBestActionPage />} />
          <Route path="/marketing/execution-workspace" element={<ExecutionWorkspacePage />} />

          {/* Accounts section — cross-module consolidated view (5-account dropdown) */}
          <Route path="/overview" element={<ConsolidatedPage />} />

          {/* Accounts — static routes BEFORE the dynamic :id (master §6) */}
          <Route path="/accounts" element={<AccountsListPage />} />
          <Route path="/accounts/planning" element={<AccountPlanningPage />} />
          <Route path="/accounts/exec-capital" element={<ExecCapitalPage />} />
          <Route path="/accounts/exec-capital/:id" element={<ExecDetailPage />} />
          {/* Sales & Growth account dossier = the 5-layer view (not a consolidated view;
              the consolidated view lives in the Accounts section at /overview). */}
          <Route path="/accounts/:id/consolidated" element={<ConsolidatedAccountPage />} />
          <Route path="/accounts/:id/report" element={<AccountReportPage />} />
          <Route path="/accounts/:id" element={<AccountInfoPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
