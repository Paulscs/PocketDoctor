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
  Bienvenido a Pocket Doctor. Al acceder o utilizar esta aplicación, usted acepta estos Términos y
  Condiciones. Si no está de acuerdo con alguna parte, le recomendamos no utilizar el servicio.
  Pocket Doctor ofrece funcionalidades de análisis y organización de información médica con fines
  informativos y de apoyo, y no sustituye la atención de un profesional de la salud.
</ThemedText>

<ThemedText style={styles.sectionTitle}>
  1. Uso del Servicio
</ThemedText>
<ThemedText style={styles.paragraph}>
  Pocket Doctor permite cargar documentos médicos (por ejemplo, resultados en PDF o imágenes) para
  extraer y organizar datos clínicos mediante tecnologías como OCR, y presentar interpretaciones
  orientativas. Usted se compromete a usar el servicio de forma responsable, lícita y conforme a
  estos términos, evitando el uso fraudulento, malicioso o que afecte el funcionamiento de la
  plataforma. La información presentada es de carácter informativo y no debe considerarse un
  diagnóstico ni una recomendación médica definitiva.
</ThemedText>

<ThemedText style={styles.sectionTitle}>
  2. Registro y Seguridad de la Cuenta
</ThemedText>
<ThemedText style={styles.paragraph}>
  Para acceder a funciones del servicio, es necesario crear una cuenta. Usted es responsable de
  mantener la confidencialidad de sus credenciales, así como de las actividades realizadas desde su
  cuenta. Pocket Doctor podrá aplicar medidas de protección como bloqueo temporal ante múltiples
  intentos fallidos, y registrar eventos relevantes de seguridad (por ejemplo, accesos, cambios o
  eliminaciones) para fines de auditoría y protección del sistema. Usted debe proporcionar
  información veraz y mantenerla actualizada.
</ThemedText>

<ThemedText style={styles.sectionTitle}>
  3. Propiedad Intelectual
</ThemedText>
<ThemedText style={styles.paragraph}>
  La aplicación, su diseño, marca, funcionalidades, interfaces y componentes son propiedad de Pocket
  Doctor o de sus licenciantes, y están protegidos por las leyes aplicables de propiedad
  intelectual. Queda prohibida la reproducción, modificación, distribución, ingeniería inversa o
  explotación no autorizada del contenido o del software. El usuario conserva la titularidad de sus
  datos personales y médicos, conforme a la Política de Privacidad.
</ThemedText>

<ThemedText style={styles.sectionTitle}>
  4. Limitación de Responsabilidad
</ThemedText>
<ThemedText style={styles.paragraph}>
  Pocket Doctor no garantiza que los resultados mostrados sean completamente exactos, completos o
  adecuados para decisiones médicas, ya que dependen de la calidad del documento cargado y del
  procesamiento automatizado. El usuario reconoce y acepta que la aplicación no sustituye la
  consulta con profesionales de la salud. En la medida permitida por la ley, Pocket Doctor no será
  responsable por daños indirectos, incidentales o consecuentes derivados del uso del servicio, ni
  por el uso que terceros puedan dar a reportes exportados o compartidos por el usuario.
</ThemedText>

<ThemedText style={styles.sectionTitle}>
  5. Modificaciones y Terminación
</ThemedText>
<ThemedText style={styles.paragraph}>
  Pocket Doctor podrá actualizar estos términos para reflejar cambios legales, mejoras de seguridad
  o nuevas funcionalidades. Las modificaciones entrarán en vigor al publicarse en la aplicación. El
  uso continuado del servicio después de los cambios implica su aceptación. Pocket Doctor podrá
  suspender o limitar el acceso cuando detecte uso indebido, riesgos de seguridad o incumplimiento
  de estos términos. El usuario puede dejar de utilizar la aplicación en cualquier momento.
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
