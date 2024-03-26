import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/homepage.css'


function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Our Company</h1>
      <Link to="/team">
        <button>Meet the Team</button>
      </Link>
      <Link to="/documentation">
        <button>Documentation</button>
      </Link>
    </div>
  );
}

export default HomePage;
