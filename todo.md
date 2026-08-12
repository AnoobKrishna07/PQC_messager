# Real-time Chat App - TODO

## Database & Backend
- [x] Create Messages table schema (id, senderId, receiverId, content, timestamp, isRead)
- [x] Create UserStatus table schema (userId, isOnline, lastSeenAt)
- [x] Run database migration
- [x] Add database query helpers in server/db.ts
- [x] Implement Socket.io WebSocket server in server/_core/index.ts
- [x] Create chat procedures in server/routers.ts (getMessages, sendMessage, getUsers, markAsRead)
- [x] Implement WebSocket event handlers (connect, disconnect, message, typing)
- [x] Add user status tracking (online/offline)
- [x] Implement auto-reconnect logic

## Frontend Components
- [x] Create Sidebar component with user list and online status indicators
- [x] Create ChatWindow component displaying message bubbles
- [x] Create MessageBubble component (blue for sent, gray for received)
- [x] Create MessageInput component with send button and Enter key support
- [x] Create TypingIndicator component
- [x] Create UserAvatar component with initials
- [x] Create UserSearch/Filter component in sidebar
- [x] Create ChatPage layout combining all components

## Frontend Features
- [x] Implement Socket.io client connection
- [x] Fetch and display list of users with online status
- [x] Load chat history when selecting a user
- [x] Send messages via Socket.io WebSocket
- [x] Receive messages in real-time
- [x] Display typing indicator when other user is typing
- [x] Auto-scroll to latest message
- [x] Search/filter users in sidebar
- [x] Display timestamps on messages
- [x] Show sender name on messages
- [x] Toast notifications for system events
- [x] Implement auto-reconnect on WebSocket disconnect

## Styling & UI
- [x] Set up dark mode theme in index.css
- [x] Configure Tailwind for dark mode
- [x] Style message bubbles (blue for sent, gray for received)
- [x] Style online/offline indicators (green/gray dots)
- [x] Add smooth animations and transitions
- [x] Implement responsive layout for mobile
- [x] Add rounded card components
- [x] Configure toast notification styling

## Authentication & Security
- [x] Verify Manus OAuth integration
- [x] Implement protected routes for chat page
- [x] Add logout functionality
- [x] Verify JWT token handling
- [x] Test protected procedures

## Testing
- [x] Write vitest tests for backend procedures
- [x] Test Socket.io event handlers (verified in dev logs)
- [x] Test message persistence
- [x] Test user status tracking
- [x] Verify real-time messaging flow
- [x] Test typing indicator
- [x] Test auto-scroll functionality
- [x] Test search/filter functionality
- [ ] Verify responsive design on mobile

## Deployment
- [ ] Create checkpoint before publishing
- [ ] Verify all features work in preview
- [ ] Publish to production
