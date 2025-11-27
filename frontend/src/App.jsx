import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import NavBar from "./components/NavBar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ItemsListPage from "./pages/ItemsListPage.jsx";
import ItemDetailPage from "./pages/ItemDetailPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

// Rota protegida
function PrivateRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <>
      {/* NavBar só aparece se estiver logado */}
      {user && <NavBar />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <ItemsListPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/items/:id"
          element={
            <PrivateRoute>
              <ItemDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Qualquer URL desconhecida → manda pra home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

