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

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export function TermsModal({ visible, onClose, onAccept }: TermsModalProps) {
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
                                Aviso Legal
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
                                Al cargar documentos en Pocket Doctor, usted reconoce y acepta las
                                siguientes condiciones de uso y políticas de privacidad:
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                1. Autenticidad y Propiedad de la Información
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Usted declara bajo protesta de decir verdad que la información y
                                los documentos proporcionados son auténticos, veraces y que posee
                                el pleno derecho legal, propiedad o autorización expresa de su
                                titular para utilizarlos y cargarlos en esta plataforma.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                2. Autorización de Procesamiento
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Usted autoriza explícitamente a Pocket Doctor y a sus sistemas
                                automatizados a procesar, analizar y extraer texto e información
                                clínica contenida en los archivos cargados mediante tecnologías de
                                reconocimiento óptico de caracteres (OCR) e inteligencia
                                artificial.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                3. Almacenamiento y Eliminación de Originales
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Entiende y acepta que los archivos originales (PDFs, imágenes)
                                cargados no serán almacenados permanentemente en nuestros
                                servidores una vez finalizado el proceso de extracción, salvo que
                                exista una autorización explícita adicional por su parte o un
                                requerimiento legal que así lo exija.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                4. Protección de Datos y Confidencialidad
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Acepta que los datos clínicos derivados del procesamiento serán
                                almacenados de forma encriptada y segura para garantizar su estricta
                                confidencialidad. Pocket Doctor implementa medidas de seguridad
                                técnicas y organizativas alineadas con la{" "}
                                <ThemedText style={styles.bold}>
                                    Ley No. 172-13 sobre Protección de Datos de Carácter Personal de la
                                    República Dominicana
                                </ThemedText>{" "}
                                y normas internacionales de privacidad y seguridad de la
                                información sanitaria.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                5. Limitación de Responsabilidad y Exactitud
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Reconoce que Pocket Doctor es una herramienta de asistencia y no
                                garantiza la exactitud absoluta, integridad o actualidad de los
                                resultados extraídos automáticamente. Pocket Doctor no se
                                responsabiliza por decisiones médicas, diagnósticos o
                                tratamientos tomados con base en la información procesada por la
                                aplicación. La verificación final de los datos siempre es
                                responsabilidad del usuario y del profesional de la salud.
                            </ThemedText>

                            <ThemedText style={styles.sectionTitle}>
                                6. Consentimiento Informado
                            </ThemedText>
                            <ThemedText style={styles.paragraph}>
                                Al continuar y pulsar "Aceptar", usted otorga su consentimiento
                                informado, libre y específico para el tratamiento de su
                                información médica y personal conforme a lo establecido en estos
                                términos.
                            </ThemedText>

                            <ThemedText style={styles.warningText}>
                                Si no está de acuerdo con alguno de los puntos anteriores, por
                                favor absténgase de cargar documentos y cierre esta ventana.
                            </ThemedText>

                            <View style={styles.spacer} />
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                                <ThemedText style={styles.acceptButtonText}>
                                    Aceptar y Continuar
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
    bold: {
        fontWeight: "700",
        color: Colors.light.black,
    },
    warningText: {
        fontSize: 13,
        color: Colors.light.error,
        marginTop: 24,
        fontStyle: "italic",
        textAlign: "center",
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
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.borderGray,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.light.textGray,
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
