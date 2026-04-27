// contexts/CollaborationContext.jsx - Fixed WebSocket and infinite loop
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const CollaborationContext = createContext();

export const useCollaboration = () => useContext(CollaborationContext);

export const CollaborationProvider = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentEditing, setCurrentEditing] = useState(null);
  const [collaborators, setCollaborators] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    // Don't connect in development if not available
    if (window.location.hostname === 'localhost' && !window.WebSocket) {
      console.warn('WebSocket not available in this environment');
      return;
    }

    try {
      const ws = new WebSocket('wss://api.data-pro.cloud/ws');
      
      ws.onopen = () => {
        console.log('Connected to collaboration server');
        setIsConnected(true);
        // Clear reconnect timeout if any
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleCollaborationMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from collaboration server');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const handleCollaborationMessage = useCallback((data) => {
    switch (data.type) {
      case 'user_joined':
        setActiveUsers(prev => {
          if (prev.some(u => u.id === data.user.id)) return prev;
          return [...prev, data.user];
        });
        break;
      case 'user_left':
        setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
        break;
      case 'content_update':
        setCollaborators(prev => ({
          ...prev,
          [data.postId]: {
            ...prev[data.postId],
            [data.userId]: data.content
          }
        }));
        break;
      case 'cursor_move':
        setCollaborators(prev => ({
          ...prev,
          [data.postId]: {
            ...prev[data.postId],
            [data.userId]: { cursor: data.position }
          }
        }));
        break;
      default:
        break;
    }
  }, []);

  const broadcastEdit = useCallback((postId, content, userId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'content_update',
        postId,
        content,
        userId,
        timestamp: new Date().toISOString()
      }));
    }
  }, [isConnected]);

  const broadcastCursor = useCallback((postId, position, userId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        postId,
        position,
        userId,
        timestamp: new Date().toISOString()
      }));
    }
  }, [isConnected]);

  const joinEditingSession = useCallback((postId) => {
    setCurrentEditing(postId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'join',
        postId,
        userId: localStorage.getItem('current_user_id')
      }));
    }
  }, [isConnected]);

  const leaveEditingSession = useCallback(() => {
    if (currentEditing && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'leave',
        postId: currentEditing,
        userId: localStorage.getItem('current_user_id')
      }));
    }
    setCurrentEditing(null);
  }, [currentEditing, isConnected]);

  const value = {
    activeUsers,
    collaborators,
    currentEditing,
    isConnected,
    broadcastEdit,
    broadcastCursor,
    joinEditingSession,
    leaveEditingSession
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};