import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";

import Dashboard from "../pages/Dashboard";
import ItemsPage from "../pages/ItemsPage";
import CustomersPage from "../pages/CustomersPage";
import SalesPage from "../pages/SalesPage";
import CustomerLedgerPage from "../pages/CustomerLedgerPage";
import SalesReportPage from "../pages/SalesReportPage";
import ItemsReportPage from "../pages/ItemsReportPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<ItemsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/customers/ledger" element={<CustomerLedgerPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/items" element={<ItemsReportPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
