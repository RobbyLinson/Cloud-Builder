import React from 'react';

const MethodCard = ({ name, functionality, location }) => {
  return (
    <div className="method-card">
      <h3>{name}</h3>
      {location && <h4 className="method-location">{location}</h4>} {/* Subheading for location */}
      <p>{functionality}</p>
    </div>
  );
};

export default MethodCard;