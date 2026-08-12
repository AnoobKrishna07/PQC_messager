import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Real-time Chat
        </h1>
        <p className="text-muted-foreground mb-8">
          Connect with others instantly. Fast, secure, and simple.
        </p>

        {/* Features */}
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm text-foreground">Real-time messaging with Socket.io</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm text-foreground">See who's online instantly</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm text-foreground">Typing indicators and read status</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm text-foreground">Secure authentication</p>
          </div>
        </div>

        {/* Login Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={() => startLogin()}
        >
          Sign In to Chat
        </Button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
