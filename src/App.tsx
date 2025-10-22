import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { DashboardLayout } from './components/dashboard-layout'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import NewClientPage from './pages/NewClientPage'
import CouriersPage from './pages/CouriersPage'
import CourierDetailPage from './pages/CourierDetailPage'
import EditCourierPage from './pages/EditCourierPage'
import NewCourierPage from './pages/NewCourierPage'
import ProvidersPage from './pages/ProvidersPage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import NewProviderPage from './pages/NewProviderPage'
import ReportsPage from './pages/ReportsPage'
import TasksPage from './pages/TasksPage'
import NewTaskPage from './pages/NewTaskPage'
import TaskDetailPage from './pages/TaskDetailPage'
import EditTaskPage from './pages/EditTaskPage'
import CloneTaskPage from './pages/CloneTaskPage'
import CourierTasksPage from './pages/CourierTasksPage'
import CourierTaskDetailPage from './pages/CourierTaskDetailPage'
import CompleteTaskPage from './pages/CompleteTaskPage'
import SuperAdminPage from './pages/SuperAdminPage'
import UserManagementPage from './pages/UserManagementPage'
import OrganizationUsersPage from './pages/OrganizationUsersPage'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="clients/new" element={<NewClientPage />} />
            <Route path="couriers" element={<CouriersPage />} />
            <Route path="couriers/:id" element={<CourierDetailPage />} />
            <Route path="couriers/:id/edit" element={<EditCourierPage />} />
            <Route path="couriers/new" element={<NewCourierPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="providers/:id" element={<ProviderDetailPage />} />
            <Route path="providers/new" element={<NewProviderPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/new" element={<NewTaskPage />} />
            <Route path="tasks/clone" element={<CloneTaskPage />} />
            <Route path="tasks/:id/edit" element={<EditTaskPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
          </Route>
          
              {/* Courier routes */}
              <Route path="/courier" element={<DashboardLayout />}>
                <Route index element={<CourierTasksPage />} />
                <Route path="tasks/:id" element={<CourierTaskDetailPage />} />
                <Route path="tasks/:id/complete" element={<CompleteTaskPage />} />
              </Route>
          
          {/* Super admin routes */}
          <Route path="/superadmin" element={<SuperAdminPage />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/organization-users/:organizationId" element={<OrganizationUsersPage />} />
          
          {/* Organization admin routes */}
          <Route path="/dashboard/clients" element={<ClientsPage />} />
          <Route path="/dashboard/providers" element={<ProvidersPage />} />
          <Route path="/dashboard/couriers" element={<CouriersPage />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App

