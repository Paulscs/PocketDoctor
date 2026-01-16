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
import { useTranslation } from "react-i18next";

interface PrivacyPolicyModalProps {
    visible: boolean;
    onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
    const { t } = useTranslation();
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
                                {t('legal.privacy_policy')}
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
                                En Pocket Doctor, la protección de su privacidad es una prioridad. Esta Política de Privacidad
                                describe de manera clara cómo recopilamos, utilizamos, almacenamos y protegemos su información
                                personal y médica, garantizando su confidencialidad, integridad y seguridad.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                1. Recopilación de Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Recopilamos únicamente la información que usted proporciona de forma voluntaria al utilizar la
                                aplicación, como nombre, correo electrónico, fecha de nacimiento y datos médicos asociados a
                                resultados clínicos. Los documentos médicos cargados se utilizan exclusivamente para su análisis
                                y no se conservan después del procesamiento, salvo autorización expresa del usuario.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                2. Uso de la Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                La información recopilada se utiliza exclusivamente para brindar los servicios de Pocket Doctor,
                                permitir el análisis orientativo de resultados médicos, personalizar la experiencia del usuario,
                                mejorar la aplicación y comunicar información relevante relacionada con el servicio o la
                                seguridad de la plataforma.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                3. Protección y Seguridad de los Datos
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Implementamos medidas técnicas y organizativas avanzadas para proteger su información contra
                                accesos no autorizados, pérdida o alteración. Los datos médicos se almacenan cifrados y las
                                comunicaciones entre la aplicación y nuestros servidores se realizan mediante conexiones
                                seguras, cumpliendo con estándares reconocidos de seguridad de la información.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                4. Compartición de Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Pocket Doctor no vende, alquila ni comparte su información personal o médica con terceros.
                                Únicamente se compartirá información cuando exista una obligación legal, consentimiento
                                explícito del usuario o sea estrictamente necesario para garantizar la seguridad del sistema.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                5. Derechos del Usuario
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Usted tiene derecho a acceder, rectificar o eliminar su información personal y médica, así como
                                a retirar su consentimiento en cualquier momento. Estas acciones pueden realizarse desde la
                                aplicación o contactando con nuestro equipo de soporte, conforme a la Ley 172-13 sobre
                                Protección de Datos Personales de la República Dominicana.
                            </ThemedText>

                            <View style={styles.spacer} />
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.acceptButton} onPress={onClose}>
                                <ThemedText style={styles.acceptButtonText}>
                                    {t('common.close')}
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
