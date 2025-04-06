import React, { useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ 
  messages, 
  messageInput, 
  handleContentChange, 
  sendMessage, 
  isOpen, 
  toggleChat,
  currentUser
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : ''}`}>
      <div className="chat-header" onClick={toggleChat}>
        <h3>Experiment Chat</h3>
        <span className="toggle-icon">{isOpen ? '▼' : '▲'}</span>
      </div>
      
      {isOpen && (
        <>
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.isOwnMessage || msg.sender === currentUser ? 'own-message' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{msg.sender}</span>
                    <span className="message-time">{formatTime(msg.time)}</span>
                  </div>
                  <div className="message-content">{msg.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} className="message-input-container">
            <input
              type="text"
              value={messageInput}
              onChange={handleContentChange}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;
