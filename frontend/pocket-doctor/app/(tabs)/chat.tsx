import React, { useCallback, useMemo } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useChatStore, FollowUpOption } from "@/src/store";

export default function ChatScreen() {
  const backgroundColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.background },
    "background"
  );

  const { messages, addUserMessage, addAIMessage } = useChatStore();

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor }],
    [backgroundColor]
  );

  const headerStyle = useMemo(
    () => [styles.header, { borderBottomColor: Colors.light.borderGray }],
    []
  );

  const handleProfilePress = useCallback(() => {
    router.push("/(tabs)/profile");
  }, []);

  const handleFollowUpOption = useCallback(
    (option: FollowUpOption, messageId: string) => {
      addUserMessage(option.text);

      setTimeout(() => {
        const followUpResponse = generateFollowUpResponse(option.id);
        addAIMessage(followUpResponse.text, followUpResponse.followUpOptions);
      }, 1000);
    },
    [addUserMessage, addAIMessage]
  );

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
            {
              id: "cholesterol-medication",
              text: "Información sobre medicamentos",
              icon: "medical-outline",
            },
            {
              id: "cholesterol-monitoring",
              text: "Programa de seguimiento",
              icon: "analytics-outline",
            },
            {
              id: "cholesterol-risks",
              text: "Factores de riesgo cardiovascular",
              icon: "warning-outline",
            },
            {
              id: "cholesterol-timeline",
              text: "Cronograma de mejora",
              icon: "calendar-outline",
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
            {
              id: "blood-pressure-monitoring",
              text: "Monitoreo de presión arterial",
              icon: "pulse-outline",
            },
            {
              id: "stress-management",
              text: "Técnicas de manejo del estrés",
              icon: "leaf-outline",
            },
            {
              id: "medication-schedule",
              text: "Horario de medicamentos",
              icon: "time-outline",
            },
            {
              id: "lifestyle-changes",
              text: "Cambios en estilo de vida",
              icon: "fitness-outline",
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
            {
              id: "nutrition-tracking",
              text: "Seguimiento nutricional",
              icon: "analytics-outline",
            },
            {
              id: "healthy-recipes",
              text: "Recetas saludables",
              icon: "book-outline",
            },
            {
              id: "portion-control",
              text: "Control de porciones",
              icon: "scale-outline",
            },
            {
              id: "supplement-guide",
              text: "Guía de suplementos",
              icon: "medical-outline",
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
            {
              id: "allergy-tracking",
              text: "Registro de síntomas",
              icon: "document-outline",
            },
            {
              id: "environmental-controls",
              text: "Control ambiental",
              icon: "home-outline",
            },
            {
              id: "emergency-preparation",
              text: "Preparación para emergencias",
              icon: "warning-outline",
            },
            {
              id: "specialist-referral",
              text: "Referencia a especialista",
              icon: "person-outline",
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
            {
              id: "medication-kit",
              text: "Kit de medicamentos de emergencia",
              icon: "medical-outline",
            },
            {
              id: "hospital-locations",
              text: "Ubicaciones de hospitales cercanos",
              icon: "location-outline",
            },
            {
              id: "emergency-procedures",
              text: "Procedimientos de emergencia",
              icon: "warning-outline",
            },
            {
              id: "family-training",
              text: "Capacitación familiar",
              icon: "people-outline",
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
            {
              id: "home-improvements",
              text: "Mejoras en el hogar",
              icon: "construct-outline",
            },
            {
              id: "product-recommendations",
              text: "Recomendaciones de productos",
              icon: "list-outline",
            },
            {
              id: "maintenance-checklist",
              text: "Lista de mantenimiento",
              icon: "checkmark-outline",
            },
            {
              id: "cost-estimates",
              text: "Estimaciones de costos",
              icon: "calculator-outline",
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
            {
              id: "schedule-appointment",
              text: "Programar cita médica",
              icon: "calendar-outline",
            },
            {
              id: "emergency-help",
              text: "Ayuda de emergencia",
              icon: "call-outline",
            },
            {
              id: "second-opinion",
              text: "Segunda opinión",
              icon: "person-outline",
            },
            {
              id: "research-resources",
              text: "Recursos de investigación",
              icon: "book-outline",
            },
            {
              id: "support-groups",
              text: "Grupos de apoyo",
              icon: "people-outline",
            },
          ],
        };
    }
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
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
            accessibilityLabel="Ir al perfil"
            accessibilityRole="button"
            accessibilityHint="Navega a la pantalla de perfil"
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
                  <Image
                    source={require("@/assets/images/logoBlue.png")}
                    style={styles.aiLogo}
                    resizeMode="contain"
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
                    accessibilityLabel={option.text}
                    accessibilityRole="button"
                    accessibilityHint="Selecciona esta opción para continuar la conversación"
                  >
                    <Ionicons
                      name={option.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={Colors.light.brandBlue}
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

        {/* Medical Disclaimer Inside Chat */}
        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={20} color={Colors.light.white} />
            </View>
            <View style={styles.warningContent}>
              <ThemedText style={styles.warningTitle}>Advertencia</ThemedText>
              <ThemedText style={styles.warningText}>
                Esta aplicación es solo para fines informativos y no reemplaza
                el diagnóstico médico profesional. Siempre consulte con un
                médico calificado para obtener asesoramiento médico adecuado.
              </ThemedText>
            </View>
          </View>
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderGray,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.brandBlue,
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.brandBlue,
  },
  profileIcon: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.brandBlue,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.white,
  },

  chatContainer: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },
  chatContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
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
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.brandBlue,
  },
  aiLogo: {
    width: 20,
    height: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.light.brandBlue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.light.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.light.white,
  },
  aiText: {
    color: Colors.light.textGray,
  },

  followUpContainer: {
    marginTop: Spacing.sm,
    marginLeft: 44,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  followUpOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.brandBlue,
    gap: Spacing.sm,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  followUpText: {
    fontSize: 14,
    color: Colors.light.brandBlue,
    fontWeight: "500",
  },

  warningSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  warningCard: {
    backgroundColor: Colors.light.warningBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.warningBorder,
  },
  warningIcon: {
    width: 32,
    height: 32,
    backgroundColor: Colors.light.warning,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: Colors.light.warningText,
    lineHeight: 16,
  },
});
