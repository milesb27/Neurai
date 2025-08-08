import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ChatResponse {
  message: string;
  nextStep?: 'location' | 'urgency' | 'appointment' | 'complete';
  extractedInfo?: {
    wantsAppointment?: boolean;
    location?: string;
    urgency?: 'emergency' | 'urgent' | 'routine';
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
  };
}

function generateNextWeekAppointments(): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];
  
  // Get next week's dates
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (7 - today.getDay() + 1) % 7 || 7);
  
  const appointments = [];
  
  // Generate 6-8 random appointments for next week
  const numAppointments = 6 + Math.floor(Math.random() * 3);
  const usedSlots = new Set();
  
  for (let i = 0; i < numAppointments; i++) {
    let dayIndex, timeIndex, slotKey;
    do {
      dayIndex = Math.floor(Math.random() * days.length);
      timeIndex = Math.floor(Math.random() * times.length);
      slotKey = `${dayIndex}-${timeIndex}`;
    } while (usedSlots.has(slotKey));
    
    usedSlots.add(slotKey);
    
    const appointmentDate = new Date(nextMonday);
    appointmentDate.setDate(nextMonday.getDate() + dayIndex);
    
    appointments.push({
      day: days[dayIndex],
      date: appointmentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      time: times[timeIndex]
    });
  }
  
  // Sort by day of week
  appointments.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));
  
  return appointments.map(apt => `• ${apt.day} ${apt.date} at ${apt.time}`).join('\n');
}

export async function processUserMessage(
  message: string, 
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
  currentStep: string = 'greeting'
): Promise<ChatResponse> {
  try {
    // Check if user is interested in scheduling
    const isSchedulingRequest = message.toLowerCase().includes('schedul') || 
                               message.toLowerCase().includes('appointment') ||
                               message.toLowerCase().includes('book') ||
                               currentStep === 'scheduling';

    let availableSlots = '';
    if (isSchedulingRequest) {
      availableSlots = generateNextWeekAppointments();
    }

    const systemPrompt = `You are an AI assistant for a neurosurgery department. Your role is to:
1. Ask if the user wants to schedule an appointment
2. When they want to schedule, show available appointment times
3. Collect their location
4. Assess urgency level (emergency, urgent, routine)
5. Gather basic contact information if they want to proceed

Current conversation step: ${currentStep}

${isSchedulingRequest ? `AVAILABLE APPOINTMENT SLOTS FOR NEXT WEEK:
${availableSlots}

When the user expresses interest in scheduling, show them these available times and ask them to choose one.` : ''}

Be professional, empathetic, and medically appropriate. For urgency:
- Emergency: Severe symptoms needing immediate attention
- Urgent: Concerning symptoms, within 1-2 weeks  
- Routine: General consultation, flexible timing

Respond with JSON containing:
- message: Your response to the user
- nextStep: The next step in the conversation
- extractedInfo: Any information you extracted from their message

Keep responses concise and caring.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || "I'm here to help you schedule an appointment. How can I assist you today?",
      nextStep: result.nextStep,
      extractedInfo: result.extractedInfo || {}
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      message: "I apologize, but I'm experiencing technical difficulties. Please try again or call our office directly for assistance.",
      nextStep: undefined
    };
  }
}

export async function analyzeUrgency(symptoms: string): Promise<'emergency' | 'urgent' | 'routine'> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical triage assistant. Analyze the described symptoms and classify urgency as 'emergency', 'urgent', or 'routine'. Respond with JSON: { 'urgency': 'emergency'|'urgent'|'routine', 'reasoning': 'brief explanation' }"
        },
        {
          role: "user",
          content: `Symptoms: ${symptoms}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.urgency || 'routine';
  } catch (error) {
    console.error('Error analyzing urgency:', error);
    return 'routine';
  }
}
