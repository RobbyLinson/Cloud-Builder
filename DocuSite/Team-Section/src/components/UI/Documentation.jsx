import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/documentation.css'; // Make sure this path is correct
import MethodCard from './MethodCard'; // Adjust the path as needed
import logo from '../../images/Cloud-Builder-Logo.png'


const methods = [
  { name: "Method 1", location: "CLI", functionality: "Does something important" },

  // Add more methods as needed
];

const Documentation = () => {
    return (
      // Using a React Fragment to avoid adding extra nodes to the DOM
      <>
        <Link to="/" className="home-button">Home</Link>
        <div className="documentation-page">
        <img src={logo} alt="Cloud Builder" className="logo" />
          <h2>Documentation</h2>
          <div className="methods-container">
            {methods.map((method, index) => (
              <MethodCard key={index} name={method.name} location={method.location} functionality={method.functionality} />
            ))}
          </div>
        </div>
      </>
    );
  };
  
  export default Documentation;
  

