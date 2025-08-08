import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, User, Send, Volume2, Expand, Shield, MapPin } from "lucide-react";
import type { ChatMessage, ChatSession } from "@shared/schema";

interface ChatInterfaceProps {
  sessionId: string;
}

interface MessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  nextStep?: string;
  extractedInfo?: any;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [currentStep, setCurrentStep] = useState("greeting");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/session", sessionId, "messages"],
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/chat/session/${sessionId}/message`, {
        content,
      });
      return response.json() as Promise<MessageResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/session", sessionId, "messages"],
      });
      if (data.nextStep) {
        setCurrentStep(data.nextStep);
      }
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const message = inputMessage;
    setInputMessage("");
    await sendMessageMutation.mutateAsync(message);
  };

  const handleQuickResponse = async (response: string) => {
    await sendMessageMutation.mutateAsync(response);
  };

  const handleUrgencySelect = async (urgency: string) => {
    await sendMessageMutation.mutateAsync(`I would classify this as ${urgency}`);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: Date | null) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLastBotMessage = () => {
    const botMessages = messages.filter(m => m.sender === "assistant");
    return botMessages[botMessages.length - 1];
  };

  const shouldShowInitialOptions = () => {
    // Show initial options if no messages exist or after the initial greeting
    return messages.length === 0 || (messages.length === 1 && messages[0].sender === "assistant");
  };

  const shouldShowTristateButtons = () => {
    const lastBotMessage = getLastBotMessage();
    return lastBotMessage && lastBotMessage.content.toLowerCase().includes("tristate area");
  };

  const shouldShowAppointmentTimeButtons = () => {
    const lastBotMessage = getLastBotMessage();
    return lastBotMessage && (lastBotMessage.content.includes("Monday") || lastBotMessage.content.includes("Tuesday") || lastBotMessage.content.includes("Wednesday"));
  };

  const shouldShowQuickResponses = () => {
    const lastBotMessage = getLastBotMessage();
    return lastBotMessage && lastBotMessage.content.toLowerCase().includes("schedule an appointment");
  };

  const shouldShowUrgencyButtons = () => {
    const lastBotMessage = getLastBotMessage();
    return lastBotMessage && lastBotMessage.content.toLowerCase().includes("urgency");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
            <Bot className="text-white text-sm" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Dr. AI Assistant</h3>
            <p className="text-sm text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Volume2 className="text-sm" />
          </Button>
          <Button variant="ghost" size="sm">
            <Expand className="text-sm" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-blue"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                <div className="text-gray-800 text-sm leading-relaxed">
                  <p className="mb-2">Hello! How can I assist you today? Here are some options:</p>
                  <p className="text-red-600 font-medium">If this is an emergency, please call 911.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Just now</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === "user" ? "justify-end" : ""
              }`}
            >
              {message.sender === "assistant" && (
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white text-sm" />
                </div>
              )}
              
              <div className={`flex-1 ${message.sender === "user" ? "flex justify-end" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 max-w-md ${
                    message.sender === "user"
                      ? "bg-medical-blue text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-800 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.sender === "user" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white text-sm" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Initial Options Buttons */}
        {shouldShowInitialOptions() && (
          <div className="grid grid-cols-2 gap-2 ml-11 max-w-md">
            <Button
              variant="outline"
              className="text-left p-3 h-auto justify-start bg-blue-50 border-blue-200 hover:bg-blue-100"
              onClick={() => handleQuickResponse("I would like to schedule an appointment")}
              disabled={sendMessageMutation.isPending}
            >
              <div>
                <p className="font-medium text-blue-800 text-sm">📅 Scheduling</p>
                <p className="text-xs text-blue-600">Book an appointment</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="text-left p-3 h-auto justify-start bg-green-50 border-green-200 hover:bg-green-100"
              onClick={() => handleQuickResponse("I need help with getting imaging")}
              disabled={sendMessageMutation.isPending}
            >
              <div>
                <p className="font-medium text-green-800 text-sm">🏥 Imaging</p>
                <p className="text-xs text-green-600">MRI, CT scans</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="text-left p-3 h-auto justify-start bg-purple-50 border-purple-200 hover:bg-purple-100"
              onClick={() => handleQuickResponse("I want to learn more about your doctors")}
              disabled={sendMessageMutation.isPending}
            >
              <div>
                <p className="font-medium text-purple-800 text-sm">👨‍⚕️ Doctors</p>
                <p className="text-xs text-purple-600">Find specialists</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="text-left p-3 h-auto justify-start bg-gray-50 border-gray-200 hover:bg-gray-100"
              onClick={() => handleQuickResponse("I have a different question")}
              disabled={sendMessageMutation.isPending}
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">❓ Something else</p>
                <p className="text-xs text-gray-600">Other inquiries</p>
              </div>
            </Button>
          </div>
        )}

        {/* Tristate Area Buttons */}
        {shouldShowTristateButtons() && (
          <div className="flex space-x-2 ml-11">
            <Button
              size="sm"
              onClick={() => handleQuickResponse("Yes, I am in the tristate area (NY, NJ, CT)")}
              disabled={sendMessageMutation.isPending}
            >
              Yes, I'm in NY/NJ/CT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickResponse("No, I am not in the tristate area")}
              disabled={sendMessageMutation.isPending}
            >
              No, I'm elsewhere
            </Button>
          </div>
        )}

        {/* Appointment Time Selection Buttons */}
        {shouldShowAppointmentTimeButtons() && (
          <div className="space-y-2 ml-11 max-w-md">
            <p className="text-xs text-gray-600 mb-2">Select a time that works for you:</p>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {/* These will be populated dynamically based on available slots shown */}
              <Button
                variant="outline"
                size="sm"
                className="text-left justify-start h-8"
                onClick={() => handleQuickResponse("I'll take the first available appointment time")}
                disabled={sendMessageMutation.isPending}
              >
                📅 First available time
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-left justify-start h-8"
                onClick={() => handleQuickResponse("Let me provide my preferred times")}
                disabled={sendMessageMutation.isPending}
              >
                ✏️ I'll specify my preference
              </Button>
            </div>
          </div>
        )}

        {/* Quick Response Buttons */}
        {shouldShowQuickResponses() && (
          <div className="flex space-x-2 ml-11">
            <Button
              size="sm"
              onClick={() => handleQuickResponse("Yes, I would like to schedule an appointment")}
              disabled={sendMessageMutation.isPending}
            >
              Yes, schedule appointment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickResponse("I need more information")}
              disabled={sendMessageMutation.isPending}
            >
              Need more info
            </Button>
          </div>
        )}

        {/* Urgency Selection */}
        {shouldShowUrgencyButtons() && (
          <div className="space-y-2 ml-11 max-w-md">
            <Button
              variant="outline"
              className="w-full justify-start text-left p-3 h-auto bg-red-50 border-red-200 hover:bg-red-100"
              onClick={() => handleUrgencySelect("emergency")}
              disabled={sendMessageMutation.isPending}
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-600 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-red-800 text-sm">Emergency</p>
                  <p className="text-xs text-red-600">Severe symptoms, immediate attention needed</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-left p-3 h-auto bg-orange-50 border-orange-200 hover:bg-orange-100"
              onClick={() => handleUrgencySelect("urgent")}
              disabled={sendMessageMutation.isPending}
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-600 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-orange-800 text-sm">Urgent</p>
                  <p className="text-xs text-orange-600">Concerning symptoms, within 1-2 weeks</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-left p-3 h-auto bg-green-50 border-green-200 hover:bg-green-100"
              onClick={() => handleUrgencySelect("routine")}
              disabled={sendMessageMutation.isPending}
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-green-800 text-sm">Routine</p>
                  <p className="text-xs text-green-600">General consultation, flexible timing</p>
                </div>
              </div>
            </Button>
          </div>
        )}

        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="resize-none"
              rows={1}
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="p-3"
          >
            <Send className="text-sm" />
          </Button>
        </div>
        
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Shield className="mr-1" size={12} />
          <span>HIPAA compliant - Your information is secure and confidential</span>
        </div>
      </div>
    </Card>
  );
}
