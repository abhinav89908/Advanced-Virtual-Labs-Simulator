
import React from 'react';
import { useRoom } from '@/context/RoomContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsersPanel: React.FC<UsersPanelProps> = ({ isOpen, onClose }) => {
  const { users } = useRoom();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className={`fixed md:absolute top-0 right-0 h-full md:h-auto w-full md:w-64 bg-background md:bg-transparent z-10 transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } md:transition-opacity md:${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <Card className="h-full md:h-auto border-l-0 md:border-l rounded-none md:rounded-md">
        <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Participants</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4">
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className={`user-avatar ${user.isActive ? 'active' : ''}`}>
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.isActive ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPanel;
