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

interface PrivacyPolicyModalProps {
    visible: boolean;
    onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
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
                                Política de Privacidad
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
                                En Pocket Doctor, nos tomamos muy en serio la privacidad de sus datos. Esta política describe cómo recopilamos, usamos y protegemos su información personal y médica.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                1. Recopilación de Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Recopilamos información que usted nos proporciona directamente, como su nombre, correo electrónico, fecha de nacimiento, y datos médicos (tipo de sangre, alergias, etc.) al registrarse y utilizar la aplicación.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                2. Uso de la Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Utilizamos su información para proporcionarle nuestros servicios, personalizar su experiencia, mejorar la aplicación y comunicarnos con usted sobre actualizaciones o alertas importantes.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                3. Protección de Datos
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra el acceso no autorizado, la pérdida o la alteración. Sus datos médicos se almacenan de forma segura y encriptada.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                4. Compartir Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                No vendemos ni alquilamos su información personal a terceros. Solo compartimos su información cuando es necesario para prestar el servicio, cumplir con la ley o proteger nuestros derechos.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                5. Sus Derechos
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento a través de la configuración de la aplicación o contactando con nuestro soporte.
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
