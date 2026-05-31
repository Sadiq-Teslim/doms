import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketCreate from "./pages/TicketCreate.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import SafetyQueue from "./pages/SafetyQueue.jsx";
import DispatchQueue from "./pages/DispatchQueue.jsx";
import OverloadReview from "./pages/OverloadReview.jsx";
import GateClearance from "./pages/GateClearance.jsx";
import Trucks from "./pages/Trucks.jsx";
import Users from "./pages/Users.jsx";
import AuditLog from "./pages/AuditLog.jsx";
import AuditDetail from "./pages/AuditDetail.jsx";
import Placeholder from "./pages/Placeholder.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute roles={["LOGISTICS", "ADMIN"]}>
              <TicketCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <ProtectedRoute roles={["SAFETY", "ADMIN"]}>
              <SafetyQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch"
          element={
            <ProtectedRoute roles={["DISPATCH", "ADMIN"]}>
              <DispatchQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overloads"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <OverloadReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gate"
          element={
            <ProtectedRoute roles={["GATE", "ADMIN"]}>
              <GateClearance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trucks"
          element={
            <ProtectedRoute roles={["LOGISTICS", "ADMIN"]}>
              <Trucks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AuditLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit/:id"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AuditDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketers"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Placeholder title="Marketers’ Records" icon="marketers" blurb="Profiles and loading history for each marketer will live here." />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Placeholder title="Reports" icon="reports" blurb="Exportable operational reports and analytics are on the way." />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<Placeholder title="Support" icon="support" blurb="Reach the DOMS support team — coming soon." />} />
        <Route path="/settings" element={<Placeholder title="Settings" icon="settings" blurb="Account and system preferences will be configurable here." />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
