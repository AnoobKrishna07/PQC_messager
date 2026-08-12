import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Search } from "lucide-react";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  isOnline: boolean;
}

interface SidebarProps {
  users: User[];
  selectedUserId?: number;
  onSelectUser: (userId: number) => void;
  onLogout: () => void;
  currentUserName?: string;
}

export function Sidebar({
  users,
  selectedUserId,
  onSelectUser,
  onLogout,
  currentUserName,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <UserAvatar name={currentUserName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{currentUserName}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {searchQuery ? "No users found" : "No users available"}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                  selectedUserId === user.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <div className="relative">
                  <UserAvatar name={user.name} size="md" />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      user.isOnline ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs opacity-70 truncate">{user.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
