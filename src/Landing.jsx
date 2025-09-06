import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css'; // Assuming you'll create a CSS file for styling

function NotFound() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="landing-title">404 - Page Not Found</h1>
        <p className="landing-subtitle">Oops! The page you're looking for doesn't exist.</p>
      </header>

      <main className="landing-main">
        <section className="landing-section">
          <h2>It seems you've wandered off the path.</h2>
          <p>Don't worry, we can help you find your way back.</p>
          <Link to="/" className="landing-button">Go to Homepage</Link>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2023 Hackathon Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default NotFound;
