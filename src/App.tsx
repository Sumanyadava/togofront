import  { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import ShortList from "@/Page/ShortList/ShortList";
import HomePage from "@/Page/Home/HomePage";
import NavBar from "./components/NavBar";
import { Toaster } from "sonner";

import Signup from "./Page/Signups/Signup";
import Login from "./Page/Signups/Login";

const App = () => {
  const [isDark, setIsDark] = useState(() => {
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

  return (
    <Router>
      <div className="h-screen scrollbar-custom overflow-auto ">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shortList/:id" element={<ShortList />} />
          <Route path="/LongProjects/:id" element={<ShortList />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </div>
      <Toaster richColors />
    </Router>
  );
};

export default App;
