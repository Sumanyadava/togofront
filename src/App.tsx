import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { fetchAllFromFirebase } from "./state/state";

import HomePage from "@/pages/home-page/HomePage";
import NavBar from "@/components/NavBar";
import { Toaster } from "sonner";

import Signup from "@/pages/auth-page/Signup";
import Login from "@/pages/auth-page/Login";
import LongList from "@/pages/long-list-page/LongList";
import LongTaskDetail from "@/pages/long-list-page/LongTaskDetail";
import TimerApp from "@/pages/timer-page/TimerApp";
import ShortList from "@/pages/short-list-page/ShortList";

// ── Protect private routes ──
const ProtectedRoute = ({ children, user }: { children: JSX.Element; user: User | null }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ── Redirect away from login if already authed ──
const PublicRoute = ({ children, user }: { children: JSX.Element; user: User | null }) => {
  if (user) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark] = useState(() => {
    return localStorage.getItem("theme") === "true";
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "true");
    } else {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "false");
    }
  }, [isDark]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchAllFromFirebase();
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen scrollbar-custom overflow-auto">
        <NavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<PublicRoute user={user}><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute user={user}><Login /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute user={user}><HomePage /></ProtectedRoute>} />
          <Route path="/shortList/:id" element={<ProtectedRoute user={user}><ShortList /></ProtectedRoute>} />
          <Route path="/LongProjects/:containerId" element={<ProtectedRoute user={user}><LongList /></ProtectedRoute>} />
          <Route path="/LongProjects/:containerId/task/:taskId" element={<ProtectedRoute user={user}><LongTaskDetail /></ProtectedRoute>} />
          <Route path="/timerapp" element={<ProtectedRoute user={user}><TimerApp /></ProtectedRoute>} />
        </Routes>
      </div>
      <Toaster richColors />
    </Router>
  );
};

export default App;
