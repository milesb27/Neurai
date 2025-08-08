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

export async function processUserMessage(
  message: string, 
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
  currentStep: string = 'greeting'
): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are an AI assistant for a neurosurgery department. Your role is to:
1. Ask if the user wants to schedule an appointment
2. Collect their location
3. Assess urgency level (emergency, urgent, routine)
4. Gather basic contact information if they want to proceed

Current conversation step: ${currentStep}

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
