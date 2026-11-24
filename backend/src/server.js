import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🏥 Hospital Management System API Server running`);
      console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`📡 URL:  http://localhost:${PORT}`);
      console.log(`===================================================`);
    });

    const shutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error(`[Server Error] Failed to start server: ${err.message}`);
    process.exit(1);
  });
