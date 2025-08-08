import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { ChatInterface } from "@/components/chat-interface";
import { AppointmentSidebar } from "@/components/appointment-sidebar";
import { AdminDashboard } from "@/components/admin-dashboard";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatSession } from "@shared/schema";

export default function Home() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/session", {
        status: "active"
      });
      return response.json() as Promise<ChatSession>;
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  useEffect(() => {
    // Create a new chat session when the component mounts
    createSessionMutation.mutate();
  }, []);

  const handleToggleView = () => {
    setIsAdminView(!isAdminView);
  };

  if (isAdminView) {
    return (
      <>
        <NavigationHeader isAdminView={isAdminView} onToggleView={handleToggleView} />
        <AdminDashboard />
      </>
    );
  }

  return (
    <>
      <NavigationHeader isAdminView={isAdminView} onToggleView={handleToggleView} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {sessionId ? (
              <ChatInterface sessionId={sessionId} />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-white rounded-xl border">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
                  <p className="text-gray-600">Initializing chat session...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Appointment Sidebar */}
          <div>
            {sessionId && <AppointmentSidebar sessionId={sessionId} />}
          </div>
        </div>
      </div>
    </>
  );
}
