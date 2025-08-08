import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MessageCircle, CalendarCheck, AlertTriangle, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "@shared/schema";

export function AdminDashboard() {
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-red-600";
      case "urgent": return "bg-orange-600";
      case "routine": return "bg-green-600";
      default: return "bg-blue-600";
    }
  };

  const getUrgencyDot = (urgency: string) => {
    return `w-2 h-2 rounded-full ${getUrgencyColor(urgency)}`;
  };

  const todaysAppointments = appointments.filter(apt => {
    if (!apt.appointmentDate) return false;
    const today = new Date();
    const aptDate = new Date(apt.appointmentDate);
    return aptDate.toDateString() === today.toDateString();
  });

  const urgentCases = appointments.filter(apt => apt.urgency === "urgent" || apt.urgency === "emergency");

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - (i + 1));
      days.push({ day: day.getDate(), isCurrentMonth: false, date: day });
    }
    
    // Current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ day, isCurrentMonth: true, date });
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Manage appointments and monitor AI assistant performance</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Appointments Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Appointment Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm font-medium text-gray-900">
                    {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="ghost" size="sm">
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((calDay, index) => {
                  const dayAppointments = getAppointmentsForDate(calDay.date);
                  const isToday = calDay.date.toDateString() === today.toDateString();
                  
                  return (
                    <div key={index} className="relative">
                      <div
                        className={`text-center py-2 text-sm cursor-pointer rounded-lg hover:bg-gray-100 ${
                          !calDay.isCurrentMonth 
                            ? "text-gray-400" 
                            : isToday
                            ? "bg-medical-blue text-white font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {calDay.day}
                        {dayAppointments.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                            {dayAppointments.slice(0, 3).map((apt, i) => (
                              <div key={i} className={getUrgencyDot(apt.urgency || "routine")}></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Emergency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Urgent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Routine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Consultation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics & Recent Appointments */}
        <div className="space-y-6">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-medical-blue">
                    {appointments.filter(apt => {
                      const today = new Date();
                      return apt.createdAt && new Date(apt.createdAt).toDateString() === today.toDateString();
                    }).length}
                  </p>
                  <p className="text-xs text-gray-600">Today's Chats</p>
                </div>
                <MessageCircle className="text-medical-blue text-lg" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{todaysAppointments.length}</p>
                  <p className="text-xs text-gray-600">Appointments</p>
                </div>
                <CalendarCheck className="text-green-600 text-lg" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{urgentCases.length}</p>
                  <p className="text-xs text-gray-600">Urgent Cases</p>
                </div>
                <AlertTriangle className="text-orange-600 text-lg" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-700">96%</p>
                  <p className="text-xs text-gray-600">Satisfaction</p>
                </div>
                <ThumbsUp className="text-gray-700 text-lg" />
              </div>
            </Card>
          </div>

          {/* Recent Appointments */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-base">Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={getUrgencyDot(appointment.urgency || "routine")}></div>
                        <span className="font-medium text-sm text-gray-900">
                          {appointment.patientName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {appointment.appointmentDate ? 
                          new Date(appointment.appointmentDate).toLocaleDateString() : 
                          "Pending"
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {appointment.notes || "Consultation"}
                    </p>
                    <p className="text-xs text-gray-500">{appointment.location}</p>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No appointments yet
                  </div>
                )}
              </div>
              
              {appointments.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <Button variant="ghost" className="w-full text-sm text-medical-blue">
                    View all appointments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
