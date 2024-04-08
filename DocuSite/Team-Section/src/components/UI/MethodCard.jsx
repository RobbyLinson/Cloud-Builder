import React from 'react';

const MethodCard = ({ name, functionality, location, parameters }) => {
  return (
    <div className="method-card">
      <h3>{name}</h3>
      {location && <h4 className="method-location">{location}</h4>}
      {/* Render parameters if available */}
      {parameters && (
        <p className="method-parameters">
          Parameters: {parameters.join(', ')}
        </p>
      )}
      <p>{functionality}</p>
    </div>
  );
};

export default MethodCard;
