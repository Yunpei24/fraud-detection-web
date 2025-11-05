import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

let socket = null;

export const connectWebSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  return socket;
};

export const subscribeToFraudAlerts = (callback) => {
  if (!socket) {
    socket = connectWebSocket();
  }

  // Subscribe to fraud alerts room
  socket.emit('subscribe:fraud-alerts');

  // Listen for new fraud alerts
  socket.on('new-fraud-alert', callback);

  return () => {
    socket.off('new-fraud-alert', callback);
  };
};

export const subscribeToNewPredictions = (callback) => {
  if (!socket) {
    socket = connectWebSocket();
  }

  socket.on('new-predictions', callback);

  return () => {
    socket.off('new-predictions', callback);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const websocketService = {
  connectWebSocket,
  subscribeToFraudAlerts,
  subscribeToNewPredictions,
  disconnectWebSocket,
};

export default websocketService;
