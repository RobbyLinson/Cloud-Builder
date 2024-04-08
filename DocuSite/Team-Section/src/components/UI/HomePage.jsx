import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/homepage.css'
import logo from '../../images/Cloud-Builder-Logo.png'



function HomePage() {
  return (
    <div className="home-page">
      <img src={logo} alt="Cloud Builder" className="logo-image" />
      <h1>Group 16</h1>
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
