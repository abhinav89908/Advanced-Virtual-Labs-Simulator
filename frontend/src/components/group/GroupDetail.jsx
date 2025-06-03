import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { Users, Send, ArrowLeft, Clock, MessageSquare, LogOut } from 'lucide-react';
import { getGroupDetails, leaveGroup, getGroupMessages, sendGroupMessage } from '../../services/groupService';
import { getUserDetails } from '../../services/userService';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [indexMissing, setIndexMissing] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const messagesInterval = useRef(null);

  // Fetch group details
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/groups/${groupId}` } });
      return;
    }

    fetchGroupDetails();
    
    // Set up polling for new messages
    messagesInterval.current = setInterval(fetchMessages, 5000);
    
    return () => {
      // Clean up the interval when component unmounts
      if (messagesInterval.current) {
        clearInterval(messagesInterval.current);
      }
    };
  }, [groupId, isLoggedIn, navigate]);

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      
      // Use Promise.all to fetch group details and messages in parallel
      const [groupRes, messagesRes] = await Promise.all([
        getGroupDetails(groupId),
        getGroupMessages(groupId)
      ]);
      
      if (groupRes.success && groupRes.group) {
        setGroup(groupRes.group);
        if (groupRes.group.members && groupRes.group.members.length > 0) {
          const memberDetails = await Promise.all(
            groupRes.group.members.map(async (memberId) => {
              // Use the new getUserDetails function
              const userDetails = await getUserDetails(memberId);
              console.log('Fetched user details:', userDetails);
              return { 
                id: memberId, 
                firstName: userDetails.firstName || 'User',
                username: userDetails.username || 'User'
              };
            })
          );
          setMembers(memberDetails);
        }
      }
      
      if (messagesRes.success) {
        setMessages(messagesRes.messages || []);
        if (messagesRes.indexMissing) {
          setIndexMissing(true);
          console.warn("Firestore index is missing for message queries. Messages may not be properly ordered.");
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Failed to load group data: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };
  
  const fetchMessages = async () => {
    try {
      const response = await getGroupMessages(groupId);
      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isSending) {
      try {
        setIsSending(true);
        
        const messageData = {
          content: inputMessage.trim(),
          userId: user.id,
          username: user.firstName 
        };
        
        await sendGroupMessage(groupId, messageData);
        setInputMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(groupId, user.id);
        navigate('/groups');
      } catch (error) {
        console.error('Error leaving group:', error);
        setError('Failed to leave the group');
      }
    }
  };
  
  const toggleMembersList = () => {
    setShowMembers(!showMembers);
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.userId === user.id;
    
    // Regular text message
    return (
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-teal-500/20 text-teal-100' : 'bg-gray-700/50 text-gray-200'} rounded-xl px-4 py-2`}>
        {!isCurrentUser && (
          <div className="text-xs font-medium text-teal-300 mb-1">
            {message.username}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="text-xs mt-1 opacity-70 flex items-center justify-end">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <ResponsiveHeader/>
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <ResponsiveHeader isConnected={true} />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || "Group not found"}</p>
          <button 
            onClick={() => navigate('/groups')} 
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Back to Groups
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <ResponsiveHeader isConnected={true} />
      
      <main className="pt-20 pb-4 container mx-auto px-4">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden shadow-xl shadow-black/10">
          {/* Group Header */}
          <div className="bg-gray-900/50 border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/groups')}
                className="mr-3 p-1.5 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">{group.name}</h1>
              <span className="ml-3 bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
                {members.length} members
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMembersList}
                className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
                  showMembers ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={handleLeaveGroup}
                className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Leave Group"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex h-[75vh]">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-gray-800/30">
                {indexMissing && (
                  <div className="mb-4 p-2 bg-yellow-500/20 text-yellow-200 rounded text-sm text-center">
                    Messages may not be properly ordered. Please contact the administrator to create the required Firestore index.
                  </div>
                )}
                
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-3" />
                    <h3 className="text-xl font-medium text-gray-300">No messages yet</h3>
                    <p className="text-gray-400 mt-2 max-w-md">
                      Be the first one to send a message in this group!
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`mb-4 flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.userId !== user.id && (
                        <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2">
                          {message.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      {renderMessage(message)}
                    </div>
                  ))
               )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-3 bg-gray-900/50 border-t border-gray-700/50">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-gray-800/60 text-white placeholder-gray-400 rounded-l-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className={`bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-r-lg flex items-center justify-center transition-colors ${
                      isSending || !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSending ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Members Sidebar - Only show when toggled */}
            {showMembers && (
              <div className="w-64 border-l border-gray-700/50 bg-gray-900/30 overflow-y-auto">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h3 className="font-medium text-white">Group Members</h3>
                  <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
                    {members.length}
                  </span>
                </div>
                <div className="p-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center mb-3 last:mb-0">
                      <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2">
                        {member.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          {member.firstName}
                          {member.id === user.id && (
                            <span className="ml-2 text-xs bg-gray-700/50 text-gray-300 px-1.5 py-0.5 rounded">
                              you
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GroupDetail;