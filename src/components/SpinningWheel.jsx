import React from 'react';

const SpinningWheel = ({ domains, duration }) => {
  // If no domains, show a generic loading state
  if (!domains || domains.length === 0) {
    return <div className="wheel-container">Loading Domains...</div>;
  }
  
  // Create a long list of domains to make the spinning seamless
  const extendedDomains = [...domains, ...domains, ...domains, ...domains, ...domains];

  return (
    <div className="wheel-container">
      <div className="wheel" style={{ animationDuration: `${duration}s` }}>
        {extendedDomains.map((domain, index) => (
          <div key={index} className="wheel-item">
            {domain}
          </div>
        ))}
      </div>
       <div className="wheel-pointer"></div>
    </div>
  );
};

export default SpinningWheel;