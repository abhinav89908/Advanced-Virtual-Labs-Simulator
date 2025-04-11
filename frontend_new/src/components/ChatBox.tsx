import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  participants: any[];
  getColorFromString: (str: string) => string;
  currentUserId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  unreadCount?: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  participants,
  getColorFromString,
  currentUserId,
  isCollapsed = false,
  onToggleCollapse,
  unreadCount = 0
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCollapsed]);

  // Focus input when chat box is opened
  useEffect(() => {
    if (!isCollapsed) {
      inputRef.current?.focus();
    }
  }, [isCollapsed]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get sender name by ID
  const getSenderName = (senderId: string) => {
    const participant = participants.find(p => p.id === senderId);
    return participant ? participant.username : 'Unknown User';
  };

  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 fixed bottom-4 right-4 shadow-lg z-10"
        onClick={onToggleCollapse}
      >
        <MessageSquare size={18} />
        <span>Chat</span>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
            {unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="w-80 fixed bottom-4 right-4 shadow-lg z-10 flex flex-col h-[450px] max-h-[80vh]">
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare size={18} />
          Chat
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onToggleCollapse}>
          <span>×</span>
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm p-4">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              const senderName = isOwnMessage ? 'You' : getSenderName(message.senderId);
              const senderColor = getColorFromString(message.senderName);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex max-w-[80%]">
                    {!isOwnMessage && (
                      <div className="mr-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback style={{ backgroundColor: senderColor }}>
                            {message.senderName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    <div>
                      {!isOwnMessage && (
                        <p className="text-xs mb-1" style={{ color: senderColor }}>
                          {message.senderName}
                        </p>
                      )}
                      
                      <div
                        className={`rounded-lg p-2 text-sm ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {message.text}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <CardFooter className="p-3 border-t">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message"
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!messageText.trim()}
          >
            <Send size={16} />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatBox;
