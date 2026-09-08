import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminDelete from "./components/AdminDelete";
import UpdateProblem from "./pages/UpdateProblem";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ComingSoon from "./pages/ComingSoon";

function App() {
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user,
    loading
  } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />

        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login />
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Signup />
          }
        />

        <Route
          path="/problem/:problemId"
          element={
            isAuthenticated ? (
              <ProblemPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <Settings />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/admin/create"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/admin/delete"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/admin/update"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <UpdateProblem />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/contest"
          element={<ComingSoon type="contest" />}
        />

        <Route
          path="/discuss"
          element={<ComingSoon type="discuss" />}
        />

        <Route
          path="/interview"
          element={<ComingSoon type="interview" />}
        />

        <Route
          path="/store"
          element={<ComingSoon type="store" />}
        />

        <Route
          path="/ai-chat"
          element={<ComingSoon type="ai" />}
        />
      </Routes>
    </>
  );
}

export default App;