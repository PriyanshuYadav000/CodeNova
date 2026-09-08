import { Routes, Route, Navigate } from 'react-router';

import { useDispatch, useSelector } from 'react-redux';

import { useEffect } from 'react';

import { checkAuth } from './authSlice';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Homepage from './pages/Homepage';
import ProblemPage from './pages/ProblemPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';

import Admin from './pages/Admin';
import UpdateProblem from './pages/UpdateProblem';

import AdminPanel from './components/AdminPanel';
import AdminDelete from './components/AdminDelete';

function App() {
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user,
    authChecked,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Homepage />}
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Signup />
          )
        }
      />

      <Route
        path="/problem/:problemId"
        element={
          isAuthenticated ? (
            <ProblemPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <Profile />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Settings />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <Admin />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/admin/create"
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/admin/delete"
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <AdminDelete />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/admin/update"
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <UpdateProblem />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/contest"
        element={
          <ComingSoon type="contest" />
        }
      />

      <Route
        path="/discuss"
        element={
          <ComingSoon type="discuss" />
        }
      />

      <Route
        path="/interview"
        element={
          <ComingSoon type="interview" />
        }
      />

      <Route
        path="/store"
        element={
          <ComingSoon type="store" />
        }
      />

      <Route
        path="/ai-chat"
        element={
          <ComingSoon type="ai" />
        }
      />

      <Route
        path="*"
        element={
          <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default App;