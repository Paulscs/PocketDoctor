import React from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface TermsConditionsModalProps {
    visible: boolean;
    onClose: () => void;
}

export function TermsConditionsModal({ visible, onClose }: TermsConditionsModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <SafeAreaView edges={["top"]} style={styles.safeArea}>
                        <View style={styles.header}>
                            <ThemedText style={styles.headerTitle}>
                                Términos y Condiciones
                            </ThemedText>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.light.black} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                            <ThemedText style={styles.introText}>
                                Bienvenido a Pocket Doctor. Al utilizar nuestra aplicación, usted acepta los siguientes términos y condiciones:
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                1. Uso del Servicio
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Pocket Doctor es una herramienta diseñada para facilitar la gestión de información médica personal. Usted se compromete a utilizar el servicio únicamente con fines legales y de acuerdo con estos términos.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                2. Registro y Seguridad de la Cuenta
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Para acceder a ciertas funciones, debe registrarse y crear una cuenta. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                3. Propiedad Intelectual
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Todo el contenido, diseño y funcionalidad de la aplicación son propiedad exclusiva de Pocket Doctor y están protegidos por las leyes de propiedad intelectual internacionales y de la República Dominicana.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                4. Limitación de Responsabilidad
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Pocket Doctor no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso del servicio. La información proporcionada no sustituye el consejo médico profesional.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                5. Modificaciones
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la aplicación.
                            </ThemedText>

                            <View style={styles.spacer} />
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.acceptButton} onPress={onClose}>
                                <ThemedText style={styles.acceptButtonText}>
                                    Cerrar
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        backgroundColor: Colors.light.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "90%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderGray,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.light.black,
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    introText: {
        fontSize: 14,
        color: Colors.light.textGray,
        lineHeight: 22,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.light.brandBlue,
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        color: Colors.light.textGray,
        lineHeight: 22,
        marginBottom: 8,
        textAlign: "justify",
    },
    spacer: {
        height: 20,
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.light.borderGray,
        gap: 16,
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: Colors.light.brandBlue,
        alignItems: "center",
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.light.white,
    },
});
