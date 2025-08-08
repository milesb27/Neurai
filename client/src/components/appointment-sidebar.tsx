import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, UserRound, HelpCircle, Phone, MessageCircle, FileText, Star } from "lucide-react";
import type { Doctor, ChatSession } from "@shared/schema";

interface AppointmentSidebarProps {
  sessionId: string;
}

export function AppointmentSidebar({ sessionId }: AppointmentSidebarProps) {
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const { data: session } = useQuery<ChatSession>({
    queryKey: ["/api/chat/session", sessionId],
    enabled: !!sessionId,
  });

  const getProgress = () => {
    if (!session) return 0;
    let progress = 0;
    if (session.location) progress += 33.3;
    if (session.urgency) progress += 33.3;
    if (session.status === "completed") progress += 33.4;
    return Math.round(progress);
  };

  const getStatusText = () => {
    if (!session) return "Initializing";
    if (session.status === "completed") return "Completed";
    if (session.urgency) return "Scheduling";
    if (session.location) return "Assessing Urgency";
    return "Information Gathering";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ));
  };

  return (
    <div className="space-y-6">

      {/* Available Doctors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <UserRound className="text-medical-blue mr-2" size={16} />
            Available Specialists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                <UserRound className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{doctor.name}</h4>
                <p className="text-xs text-gray-600">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <div className="flex mr-1">
                    {renderStars(doctor.rating || 5)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {doctor.rating || 4.9} ({doctor.reviewCount || 0})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Help & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <HelpCircle className="text-medical-blue mr-2" size={16} />
            Contact Us:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Phone className="text-medical-blue mr-3" size={16} />
            <div className="text-left">
              <p className="font-medium text-gray-900 text-sm">Call Us</p>
              <p className="text-xs text-gray-600">(917) 414-9116</p>
            </div>
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <MessageCircle className="text-medical-blue mr-3" size={16} />
            <div className="text-left">
              <p className="font-medium text-gray-900 text-sm">Access records</p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
