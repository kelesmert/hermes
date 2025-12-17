import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/app-layout.jsx';
import LoginPage from '@/features/auth/pages/login.jsx';
import DashboardPage from '@/features/dashboard/pages/dashboard.jsx';
import MonitoringPage from '@/features/monitoring/pages/monitoring.jsx';
import ReportsPage from '@/features/reports/pages/reports.jsx';
import UsersPage from '@/features/users/pages/users.jsx';
import MachinesPage from '@/features/machines/pages/machines.jsx';
import PartsPage from '@/features/parts/pages/parts.jsx';
import JobOrdersPage from '@/features/production/pages/job-orders.jsx';
import DowntimesPage from '@/features/downtime/pages/downtimes.jsx';
import SimulationsPage from '@/features/simulations/pages/simulations.jsx';
import NotFoundPage from '@/components/feedback/not-found.jsx';
import PrivateRoute from '@/app/routes/private-route.jsx';
import PermissionGuard from '@/app/routes/permission-guard.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<PrivateRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <PermissionGuard requiredPermissions={["dashboard.read"]}>
              <DashboardPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <PermissionGuard requiredPermissions={["reports.read"]}>
              <ReportsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/monitoring"
          element={
            <PermissionGuard requiredPermissions={["dashboard.read"]}>
              <MonitoringPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/users"
          element={
            <PermissionGuard requiredPermissions={["users.manage"]}>
              <UsersPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/machines"
          element={
            <PermissionGuard requiredPermissions={["machines.read"]}>
              <MachinesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/parts"
          element={
            <PermissionGuard requiredPermissions={["parts.read"]}>
              <PartsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/production"
          element={
            <PermissionGuard requiredPermissions={["production.read"]}>
              <JobOrdersPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/downtimes"
          element={
            <PermissionGuard mode="any" requiredPermissions={["work_orders.execute", "production.manage"]}>
              <DowntimesPage />
            </PermissionGuard>
          }
        />
        <Route
          path="/simulations"
          element={
            <PermissionGuard requiredPermissions={["production.manage"]}>
              <SimulationsPage />
            </PermissionGuard>
          }
        />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
