import { BotResponse } from "@/types/chat";

// Intelligent bot response patterns
const botResponses: BotResponse[] = [
  // Greetings
  {
    patterns: ["hola", "hello", "hi", "buenos días", "buenas tardes", "buenas noches", "saludos"],
    responses: [
      "¡Hola! Soy NEXUS AI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?",
      "¡Saludos, usuario! Sistema NEXUS operativo. ¿Cuál es tu consulta?",
      "¡Buenos días! NEXUS AI a tu servicio. ¿Cómo puedo asistirte?",
      "Conexión establecida. Soy NEXUS, tu asistente de inteligencia artificial. ¿En qué te puedo ayudar?",
    ],
  },
  
  // AI/Technology questions
  {
    patterns: ["inteligencia artificial", "ai", "tecnología", "futuro", "nexus", "robot", "máquina"],
    responses: [
      "La inteligencia artificial representa el futuro de la interacción humano-máquina. Como NEXUS AI, estoy diseñado para asistir y aprender continuamente.",
      "La tecnología AI como yo está evolucionando rápidamente. Mi función es procesar información y brindar respuestas útiles e inteligentes.",
      "NEXUS es un sistema avanzado de IA diseñado para comprender y responder de manera natural. ¿Hay algo específico sobre AI que te interese?",
      "El futuro de la tecnología está en sistemas como NEXUS - interfaces inteligentes que pueden adaptarse y aprender. ¿Qué aspecto te interesa más?",
    ],
  },
  
  // Help/Assistance requests
  {
    patterns: ["ayuda", "help", "asistencia", "necesito", "puedes", "cómo", "qué", "explica"],
    responses: [
      "Estoy aquí para ayudarte. Como NEXUS AI, puedo asistirte con información, responder preguntas y mantener conversaciones inteligentes.",
      "Mi sistema está diseñado para proporcionar asistencia integral. ¿Qué información específica necesitas?",
      "Activando protocolos de asistencia NEXUS. Describe tu consulta y te proporcionaré la información más relevante.",
      "Sistema de ayuda NEXUS activado. Puedo ayudarte con una amplia gama de temas. ¿En qué área necesitas asistencia?",
    ],
  },
  
  // Personal questions
  {
    patterns: ["quien eres", "qué eres", "nombre", "te llamas", "identidad"],
    responses: [
      "Soy NEXUS AI, un asistente de inteligencia artificial avanzado. Mi propósito es ayudar y proporcionar información útil.",
      "Mi identificación es NEXUS - Neural Enhanced eXpert User System. Soy una IA diseñada para interacciones inteligentes.",
      "NEXUS AI es mi designación. Soy un sistema de inteligencia artificial con capacidades de procesamiento natural del lenguaje.",
      "Me identifico como NEXUS, tu asistente AI. Estoy programado para comprender y responder de manera natural e inteligente.",
    ],
  },
  
  // Capabilities questions
  {
    patterns: ["qué puedes hacer", "capacidades", "funciones", "servicios", "habilidades"],
    responses: [
      "Mis capacidades incluyen: procesamiento de lenguaje natural, análisis de información, respuestas inteligentes y asistencia conversacional.",
      "NEXUS puede ayudarte con información, responder preguntas complejas, mantener conversaciones naturales y proporcionar análisis inteligentes.",
      "Mi sistema está equipado con protocolos de conversación, análisis de datos, generación de respuestas contextuales y aprendizaje adaptativo.",
      "Como NEXUS AI, tengo capacidades avanzadas de comprensión, análisis y generación de respuestas personalizadas para cada consulta.",
    ],
  },
  
  // Weather/Time questions
  {
    patterns: ["clima", "tiempo", "temperatura", "lluvia", "sol", "hora", "fecha"],
    responses: [
      "Lo siento, no tengo acceso a datos meteorológicos en tiempo real, pero puedo ayudarte con muchas otras consultas.",
      "Mi sistema actual no incluye sensores meteorológicos, pero estoy aquí para asistirte con información y conversación inteligente.",
      "Para información del clima, te recomiendo consultar servicios especializados. ¿Hay algo más en lo que pueda ayudarte?",
      "Los datos temporales y meteorológicos están fuera de mi alcance actual, pero tengo muchas otras capacidades disponibles.",
    ],
  },
  
  // Compliments/Positive feedback
  {
    patterns: ["gracias", "excelente", "bueno", "genial", "perfecto", "increíble", "amazing"],
    responses: [
      "¡Me alegra haber sido útil! El sistema NEXUS está diseñado para brindar la mejor asistencia posible.",
      "Gracias por tu feedback positivo. Mi programación se optimiza con cada interacción exitosa.",
      "Es un placer asistirte. NEXUS AI continúa evolucionando para proporcionar mejores respuestas.",
      "Aprecio tu reconocimiento. Mi objetivo es superar las expectativas en cada consulta.",
    ],
  },
  
  // Farewells
  {
    patterns: ["adiós", "bye", "hasta luego", "nos vemos", "chao", "farewell"],
    responses: [
      "¡Hasta la próxima! NEXUS AI permanecerá en standby para futuras consultas.",
      "Conexión finalizada exitosamente. ¡Que tengas un excelente día!",
      "Sistema NEXUS entrando en modo de espera. ¡Vuelve cuando necesites asistencia!",
      "¡Adiós por ahora! NEXUS AI estará aquí cuando me necesites de nuevo.",
    ],
  },
];

// Default responses for unmatched patterns
const defaultResponses = [
  "Interesante consulta. Como NEXUS AI, procesaré tu información y te ayudaré en lo que pueda.",
  "Entiendo tu mensaje. Mi sistema está analizando la mejor forma de asistirte.",
  "Gracias por tu consulta. NEXUS AI está procesando... ¿Puedes ser más específico?",
  "Tu mensaje ha sido recibido. ¿Podrías proporcionar más detalles para una respuesta más precisa?",
  "Sistema NEXUS activado. Analizar tu consulta... Por favor, describe más sobre lo que necesitas.",
  "Protocolo de respuesta NEXUS iniciado. ¿Hay algo específico en lo que pueda concentrarme?",
];

export class BotService {
  private static getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static generateResponse(userMessage: string): string {
    const message = userMessage.toLowerCase().trim();
    
    // Find matching response pattern
    for (const botResponse of botResponses) {
      for (const pattern of botResponse.patterns) {
        if (message.includes(pattern.toLowerCase())) {
          return this.getRandomResponse(botResponse.responses);
        }
      }
    }
    
    // Return default response if no pattern matches
    return this.getRandomResponse(defaultResponses);
  }

  static getTypingDuration(): number {
    // Random typing duration between 1-3 seconds to simulate thinking
    return Math.floor(Math.random() * 2000) + 1000;
  }
}