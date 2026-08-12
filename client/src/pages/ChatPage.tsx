import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { toast } from "sonner";
import {
  initializeSocket,
  disconnectSocket,
  emitUserJoin,
  emitMessage,
  emitTyping,
  emitStopTyping,
  emitLogout,
  onReceiveMessage,
  onUserStatusChanged,
  onUserTyping,
  onUserStopTyping,
} from "../services/socket";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
}

interface User {
  id: number;
  name: string | null;
  email: string | null;
  isOnline: boolean;
}

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = trpc.chat.getUsers.useQuery();

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = trpc.chat.getMessages.useQuery(
    { otherUserId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      // Message will be received via Socket.io
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });

  // Initialize Socket.io and set up listeners
  useEffect(() => {
    if (!user?.id) return;

    const socket = initializeSocket();
    emitUserJoin(user.id);

    // Listen for incoming messages
    onReceiveMessage((data) => {
      if (data.senderId === selectedUserId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random(),
            senderId: data.senderId,
            receiverId: user.id,
            content: data.content,
            createdAt: new Date(data.timestamp),
          },
        ]);
      }
    });

    // Listen for user status changes
    onUserStatusChanged((data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId ? { ...u, isOnline: data.isOnline } : u
        )
      );
    });

    // Listen for typing indicator
    onUserTyping((data) => {
      if (data.senderId === selectedUserId) {
        setTypingUsers((prev) => new Set([...prev, data.senderId]));
      }
    });

    // Listen for stop typing indicator
    onUserStopTyping((data) => {
      if (data.senderId === selectedUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.senderId);
          return newSet;
        });
      }
    });

    return () => {
      // Cleanup listeners
    };
  }, [user?.id, selectedUserId]);

  // Update users list
  useEffect(() => {
    if (usersData) {
      setUsers(usersData as User[]);
    }
  }, [usersData]);

  // Update messages
  useEffect(() => {
    if (messagesData) {
      setMessages(
        messagesData.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [messagesData]);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!user?.id || !selectedUserId) return;

      // Add message to local state optimistically
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random(),
          senderId: user.id,
          receiverId: selectedUserId,
          content,
          createdAt: new Date(),
        },
      ]);

      // Send via tRPC to persist in database
      sendMessageMutation.mutate({
        receiverId: selectedUserId,
        content,
      });

      // Send via Socket.io for real-time delivery
      emitMessage(user.id, selectedUserId, content);
    },
    [user?.id, selectedUserId, sendMessageMutation]
  );

  const handleTyping = useCallback(() => {
    if (!user?.id || !selectedUserId) return;
    if (isTyping) return;
    setIsTyping(true);
    emitTyping(user.id, selectedUserId);
  }, [user?.id, selectedUserId, isTyping]);

  const handleStopTyping = useCallback(() => {
    if (!user?.id || !selectedUserId) return;
    setIsTyping(false);
    emitStopTyping(user.id, selectedUserId);
  }, [user?.id, selectedUserId]);

  const handleLogout = useCallback(() => {
    if (user?.id) {
      emitLogout(user.id);
    }
    disconnectSocket();
    logout();
  }, [user?.id, logout]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        onLogout={handleLogout}
        currentUserName={user.name || "User"}
      />
      <ChatWindow
        messages={messages}
        currentUserId={user.id}
        selectedUser={selectedUser}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        isTyping={typingUsers.has(selectedUserId!)}
        isLoading={messagesLoading}
      />
    </div>
  );
}
