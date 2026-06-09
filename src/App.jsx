import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import FindDonor from './pages/FindDonor';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './styles/global.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/find" element={<FindDonor />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
