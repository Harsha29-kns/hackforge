import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HardDrive, Clock, ArrowLeft } from 'lucide-react';
import './Landing.css'; 

function NotFound() {
  const calculateTimeLeft = () => {
    const eventDate = new Date('2025-09-20T09:00:00');
    const difference = +eventDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="not-found-container">
      <div className="noise-overlay"></div>
      <motion.div
        className="content-wrapper"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <motion.div 
          className="icon-container"
          animate={{
            rotate: [0, 5, -5, 0],
            transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <HardDrive size={60} className="main-icon" />
        </motion.div>
        
        <h1 className="main-title">Under Construction</h1>
        <p className="subtitle">The Team Dashboard is currently being forged for the Hackathon.</p>
        
        <div className="message-box">
          <p>This module will be deployed and available on the day of the event.</p>
          <p className="highlight">Please do not attempt to access this page again until the event begins.</p>
        </div>

        <div className="countdown-container">
          <h2 className="countdown-title">
            <Clock size={20} className="countdown-icon" />
            Time Until Launch
          </h2>
          <div className="timer">
            <div className="timer-segment">
              <span className="timer-number">{timeLeft.days || '0'}</span>
              <span className="timer-label">Days</span>
            </div>
            <div className="timer-segment">
              <span className="timer-number">{timeLeft.hours || '0'}</span>
              <span className="timer-label">Hours</span>
            </div>
            <div className="timer-segment">
              <span className="timer-number">{timeLeft.minutes || '0'}</span>
              <span className="timer-label">Minutes</span>
            </div>
            <div className="timer-segment">
              <span className="timer-number">{timeLeft.seconds || '0'}</span>
              <span className="timer-label">Seconds</span>
            </div>
          </div>
        </div>

        <Link to="/" className="home-button">
          <ArrowLeft size={20} />
          Return to Instructions
        </Link>
      </motion.div>
      <footer className="footer-credit">
        &copy; {new Date().getFullYear()} HackForge. All rights reserved.
      </footer>
    </div>
  );
}

export default NotFound;