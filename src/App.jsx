import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, lazy, Suspense } from 'react';
import "./index.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import ScrollRuler from "./components/ScrollRuler";
import ContactPage from "./Pages/Contact";
import WelcomeScreen from "./Pages/WelcomeScreen";
import { AnimatePresence } from 'framer-motion';

const Portofolio = lazy(() => import("./Pages/Portofolio"));
const ProjectDetails = lazy(() => import("./components/ProjectDetail"));

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <Navbar />
          <ScrollRuler />
          <AnimatedBackground />
          <Home />
          <About />
          <Portofolio />
          <ContactPage />
          <footer className="border-t border-hair pb-28 pt-6">
            <div className="rail">
              <span className="hud block text-center">
                © 2025{" "}
                <a href="https://flowbite.com/" className="hover:text-fg">
                  Anuphap™
                </a>
                . All Rights Reserved.
              </span>
            </div>
          </footer>
        </>
      )}
    </>
  );
};

const ProjectPageLayout = () => (
  <>
    <ProjectDetails />
    <footer className="border-t border-hair pb-8 pt-6">
      <div className="rail">
        <span className="hud block text-center">
          © 2025{" "}
          <a href="https://flowbite.com/" className="hover:text-fg">
            Anuphap™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  </>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-ink" />}>
        <Routes>
          <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
          <Route path="/project/:id" element={<ProjectPageLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;