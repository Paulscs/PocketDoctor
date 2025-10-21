import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  followUpOptions?: FollowUpOption[];
}

interface FollowUpOption {
  id: string;
  text: string;
  icon: string;
}

interface MedicalData {
  id: string;
  name: string;
  value: string;
  normalRange: string;
  status: "normal" | "elevated" | "low";
}

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medicalHistory: MedicalData[];
}

const COLORS = {
  BRAND_BLUE: "#002D73",
  LIGHT_BLUE: "#5A7BB5",
  MEDICAL_BLUE: "#1E40AF",
  HEALTH_GREEN: "#059669",
  WHITE: "#FFFFFF",
  GRAY_50: "#F9FAFB",
  GRAY_100: "#F3F4F6",
  GRAY_200: "#E5E7EB",
  GRAY_300: "#D1D5DB",
  GRAY_400: "#9CA3AF",
  GRAY_500: "#6B7280",
  GRAY_600: "#4B5563",
  GRAY_700: "#374151",
  GRAY_800: "#1F2937",
  GRAY_900: "#111827",
} as const;

const MOCK_USER_PROFILE: UserProfile = {
  name: "Ethan",
  age: 28,
  gender: "Masculino",
  bloodType: "O+",
  allergies: ["Penicilina", "Polen"],
  conditions: ["Hipertensión leve"],
  medicalHistory: [
    {
      id: "1",
      name: "Hemoglobina",
      value: "12.5 g/dL",
      normalRange: "12.0-15.5 g/dL",
      status: "normal",
    },
    {
      id: "2",
      name: "Células blancas",
      value: "8.2 K/μL",
      normalRange: "4.0-11.0 K/μL",
      status: "normal",
    },
    {
      id: "3",
      name: "Colesterol",
      value: "245 mg/dL",
      normalRange: "<200 mg/dL",
      status: "elevated",
    },
    {
      id: "4",
      name: "Creatinina",
      value: "0.9 mg/dL",
      normalRange: "0.6-1.2 mg/dL",
      status: "normal",
    },
  ],
};

export default function ChatScreen() {
  const backgroundColor = useThemeColor(
    { light: COLORS.WHITE, dark: "#000000" },
    "background"
  );

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hola ${MOCK_USER_PROFILE.name}! 👋 Soy tu asistente médico con IA. He revisado tu historial médico y veo que tienes algunos valores que requieren atención, especialmente tu colesterol elevado (245 mg/dL). ¿Te gustaría que analicemos estos resultados juntos?`,
      isUser: false,
      timestamp: new Date(),
      followUpOptions: [
        {
          id: "analyze-cholesterol",
          text: "Analizar mi colesterol elevado",
          icon: "heart-outline",
        },
        {
          id: "review-all-results",
          text: "Revisar todos mis resultados",
          icon: "document-text-outline",
        },
        {
          id: "get-recommendations",
          text: "Obtener recomendaciones",
          icon: "bulb-outline",
        },
      ],
    },
  ]);

  const getContextualSuggestions = () => {
    const elevatedValues = MOCK_USER_PROFILE.medicalHistory.filter(
      data => data.status === "elevated"
    );
    const suggestions = [];

    if (
      elevatedValues.some(data =>
        data.name.toLowerCase().includes("colesterol")
      )
    ) {
      suggestions.push({
        id: "cholesterol",
        title: "Manejo del Colesterol",
        subtitle:
          "Tu colesterol está elevado (245 mg/dL). Te ayudo a entender qué hacer.",
        icon: "heart-outline",
        message:
          "Mi colesterol está en 245 mg/dL, que está por encima del rango normal. ¿Qué puedo hacer para bajarlo de forma natural?",
      });
    }

    if (MOCK_USER_PROFILE.conditions.includes("Hipertensión leve")) {
      suggestions.push({
        id: "hypertension",
        title: "Control de Hipertensión",
        subtitle: "Gestión de tu presión arterial elevada",
        icon: "pulse-outline",
        message:
          "Tengo hipertensión leve. ¿Qué cambios en mi estilo de vida me recomiendas para controlarla mejor?",
      });
    }

    if (MOCK_USER_PROFILE.allergies.length > 0) {
      suggestions.push({
        id: "allergies",
        title: "Gestión de Alergias",
        subtitle: `Alergias: ${MOCK_USER_PROFILE.allergies.join(", ")}`,
        icon: "medical-outline",
        message: `Tengo alergias a ${MOCK_USER_PROFILE.allergies.join(" y ")}. ¿Cómo puedo manejarlas mejor en mi día a día?`,
      });
    }

    suggestions.push({
      id: "general-health",
      title: "Salud General",
      subtitle: "Recomendaciones personalizadas para tu perfil",
      icon: "fitness-outline",
      message:
        "Basándote en mi perfil médico, ¿qué recomendaciones generales tienes para mejorar mi salud?",
    });

    suggestions.push({
      id: "specialists",
      title: "Especialistas Recomendados",
      subtitle: "Encuentra médicos especializados en tu área",
      icon: "business-outline",
      message:
        "¿Qué especialistas me recomiendas consultar basándote en mis resultados médicos?",
    });

    return suggestions;
  };

  const handleSuggestedAction = (actionId: string) => {
    const suggestions = getContextualSuggestions();
    const selectedSuggestion = suggestions.find(s => s.id === actionId);

    if (selectedSuggestion) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: selectedSuggestion.message,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);

      setTimeout(() => {
        const contextualResponse = generateContextualResponse(
          actionId,
          selectedSuggestion
        );
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: contextualResponse.text,
          isUser: false,
          timestamp: new Date(),
          followUpOptions: contextualResponse.followUpOptions,
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const generateContextualResponse = (
    actionId: string,
    suggestion: any
  ): { text: string; followUpOptions: FollowUpOption[] } => {
    switch (actionId) {
      case "cholesterol":
        return {
          text: `Entiendo tu preocupación por el colesterol elevado. Con 245 mg/dL, es importante tomar medidas. Te recomiendo:\n\n• Reducir grasas saturadas y trans\n• Aumentar fibra soluble (avena, legumbres)\n• Ejercicio regular (30 min/día)\n• Considerar omega-3`,
          followUpOptions: [
            {
              id: "diet-plan",
              text: "Crear plan de dieta específico",
              icon: "restaurant-outline",
            },
            {
              id: "exercise-routine",
              text: "Rutina de ejercicio personalizada",
              icon: "fitness-outline",
            },
            {
              id: "supplements",
              text: "Información sobre suplementos",
              icon: "medical-outline",
            },
          ],
        };

      case "hypertension":
        return {
          text: `Para tu hipertensión leve, estos cambios pueden ayudar:\n\n• Reducir sodio a <2g/día\n• Ejercicio aeróbico regular\n• Técnicas de relajación\n• Controlar el peso\n• Limitar alcohol`,
          followUpOptions: [
            {
              id: "hypertension-plan",
              text: "Crear plan específico para hipertensión",
              icon: "calendar-outline",
            },
            {
              id: "stress-management",
              text: "Técnicas de manejo del estrés",
              icon: "leaf-outline",
            },
            {
              id: "monitoring",
              text: "Cómo monitorear mi presión",
              icon: "pulse-outline",
            },
          ],
        };

      case "allergies":
        return {
          text: `Para manejar tus alergias a ${MOCK_USER_PROFILE.allergies.join(" y ")}:\n\n• Evitar exposición conocida\n• Antihistamínicos según prescripción\n• Purificador de aire en casa\n• Consultar alergólogo`,
          followUpOptions: [
            {
              id: "allergy-calendar",
              text: "Calendario de alergias estacionales",
              icon: "calendar-outline",
            },
            {
              id: "emergency-plan",
              text: "Plan de emergencia para alergias",
              icon: "medical-outline",
            },
            {
              id: "home-tips",
              text: "Consejos para el hogar",
              icon: "home-outline",
            },
          ],
        };

      case "general-health":
        return {
          text: `Basándome en tu perfil (${MOCK_USER_PROFILE.age} años, ${MOCK_USER_PROFILE.gender}, ${MOCK_USER_PROFILE.bloodType}):\n\n• Colesterol elevado requiere atención\n• Hipertensión leve necesita monitoreo\n• Ejercicio cardiovascular regular\n• Dieta mediterránea recomendada`,
          followUpOptions: [
            {
              id: "health-plan",
              text: "Crear plan de salud completo",
              icon: "clipboard-outline",
            },
            {
              id: "lifestyle-changes",
              text: "Cambios de estilo de vida",
              icon: "trending-up-outline",
            },
            {
              id: "prevention",
              text: "Estrategias de prevención",
              icon: "shield-outline",
            },
          ],
        };

      case "specialists":
        return {
          text: `Basándome en tus resultados, te recomiendo consultar:\n\n• Cardiólogo (colesterol + hipertensión)\n• Nutricionista (plan alimentario)\n• Alergólogo (${MOCK_USER_PROFILE.allergies.join(", ")})`,
          followUpOptions: [
            {
              id: "find-cardiologist",
              text: "Buscar cardiólogo cerca",
              icon: "location-outline",
            },
            {
              id: "find-nutritionist",
              text: "Buscar nutricionista",
              icon: "restaurant-outline",
            },
            {
              id: "find-allergist",
              text: "Buscar alergólogo",
              icon: "medical-outline",
            },
          ],
        };

      default:
        return {
          text: "Gracias por tu consulta. Estoy analizando tu información médica para darte la mejor respuesta personalizada.",
          followUpOptions: [
            {
              id: "more-info",
              text: "Necesito más información",
              icon: "help-circle-outline",
            },
          ],
        };
    }
  };

  const handleFollowUpOption = (option: FollowUpOption, messageId: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option.text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const followUpResponse = generateFollowUpResponse(option.id);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: followUpResponse.text,
        isUser: false,
        timestamp: new Date(),
        followUpOptions: followUpResponse.followUpOptions,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateFollowUpResponse = (
    optionId: string
  ): { text: string; followUpOptions: FollowUpOption[] } => {
    switch (optionId) {
      case "analyze-cholesterol":
        return {
          text: "Analicemos tu colesterol de 245 mg/dL. Este valor está significativamente por encima del rango normal (<200 mg/dL). Esto aumenta tu riesgo cardiovascular.",
          followUpOptions: [
            {
              id: "cholesterol-diet",
              text: "Plan de dieta para reducir colesterol",
              icon: "restaurant-outline",
            },
            {
              id: "cholesterol-exercise",
              text: "Ejercicios específicos",
              icon: "fitness-outline",
            },
          ],
        };

      case "hypertension-plan":
        return {
          text: "Perfecto! Te ayudo a crear un plan específico para tu hipertensión leve. Empezaremos con cambios graduales y medibles.",
          followUpOptions: [
            {
              id: "weekly-plan",
              text: "Plan semanal detallado",
              icon: "calendar-outline",
            },
            {
              id: "tracking-tools",
              text: "Herramientas de seguimiento",
              icon: "analytics-outline",
            },
          ],
        };

      case "diet-plan":
        return {
          text: "Excelente elección! Un plan de dieta específico puede reducir tu colesterol significativamente. Te crearé un plan personalizado.",
          followUpOptions: [
            {
              id: "meal-plan",
              text: "Plan de comidas semanal",
              icon: "restaurant-outline",
            },
            {
              id: "shopping-list",
              text: "Lista de compras saludables",
              icon: "list-outline",
            },
          ],
        };

      case "allergy-calendar":
        return {
          text: "Te ayudo con el calendario de alergias. Para Penicilina: evitar siempre. Para Polen: temporada alta en primavera (marzo-mayo).",
          followUpOptions: [
            {
              id: "seasonal-tips",
              text: "Consejos por temporada",
              icon: "calendar-outline",
            },
            {
              id: "medication-schedule",
              text: "Horario de medicamentos",
              icon: "time-outline",
            },
          ],
        };

      case "emergency-plan":
        return {
          text: "Plan de emergencia para tus alergias:\n\n• Siempre llevar antihistamínicos\n• Identificar síntomas graves\n• Tener contacto de emergencia\n• Conocer ubicación del hospital más cercano",
          followUpOptions: [
            {
              id: "emergency-contacts",
              text: "Configurar contactos de emergencia",
              icon: "call-outline",
            },
            {
              id: "symptom-tracker",
              text: "Registrar síntomas",
              icon: "document-outline",
            },
          ],
        };

      case "home-tips":
        return {
          text: "Consejos para tu hogar:\n\n• Purificador de aire HEPA\n• Aspirar regularmente\n• Evitar alfombras\n• Ventilar en horarios de bajo polen",
          followUpOptions: [
            {
              id: "cleaning-schedule",
              text: "Cronograma de limpieza",
              icon: "calendar-outline",
            },
            {
              id: "air-quality",
              text: "Monitorear calidad del aire",
              icon: "leaf-outline",
            },
          ],
        };

      default:
        return {
          text: "Gracias por tu interés. Estoy preparando información específica para ti.",
          followUpOptions: [
            {
              id: "more-details",
              text: "Más detalles",
              icon: "information-circle-outline",
            },
          ],
        };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logoBlue.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.logoText}>POCKET DOCTOR</ThemedText>
          </View>
        </View>
        <View style={styles.headerRight}>
          <ThemedText style={styles.pageTitle}>Chat</ThemedText>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.profileIconText}>A</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(message => (
          <View key={message.id}>
            <View
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiIcon}>
                  <IconSymbol
                    name="person.fill"
                    size={16}
                    color={COLORS.WHITE}
                  />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.text}
                </ThemedText>
              </View>
            </View>

            {message.followUpOptions && message.followUpOptions.length > 0 && (
              <View style={styles.followUpContainer}>
                {message.followUpOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.followUpOption}
                    onPress={() => handleFollowUpOption(option, message.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={16}
                      color={COLORS.BRAND_BLUE}
                    />
                    <ThemedText style={styles.followUpText}>
                      {option.text}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {messages.length === 1 && (
          <View style={styles.suggestedActions}>
            {getContextualSuggestions().map(suggestion => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestedCard}
                onPress={() => handleSuggestedAction(suggestion.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  <Ionicons
                    name={suggestion.icon as any}
                    size={20}
                    color={COLORS.BRAND_BLUE}
                  />
                </View>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle}>
                    {suggestion.title}
                  </ThemedText>
                  <ThemedText style={styles.cardSubtitle}>
                    {suggestion.subtitle}
                  </ThemedText>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={COLORS.GRAY_400}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.BRAND_BLUE,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.BRAND_BLUE,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.WHITE,
  },

  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },

  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  aiIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.BRAND_BLUE,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: COLORS.BRAND_BLUE,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.WHITE,
  },
  aiText: {
    color: COLORS.GRAY_700,
  },

  suggestedActions: {
    marginTop: 20,
    gap: 12,
  },
  suggestedCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY_800,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY_500,
    lineHeight: 18,
  },

  followUpContainer: {
    marginTop: 8,
    marginLeft: 44,
    marginBottom: 8,
    gap: 6,
  },
  followUpOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.BRAND_BLUE,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  followUpText: {
    fontSize: 14,
    color: COLORS.BRAND_BLUE,
    fontWeight: "500",
  },
});
