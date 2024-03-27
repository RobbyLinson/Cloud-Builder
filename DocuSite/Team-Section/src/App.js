import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// import HomePage from './components/UI/HomePage';
// import Team from './components/UI/Team';

const HomePage = lazy(() => import('./components/UI/HomePage'));
const Team = lazy(() => import('./components/UI/Team'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </Suspense>
    </Router>
  );
}



export default App;
