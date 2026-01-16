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

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ visible, onClose, onAccept }: TermsModalProps) {
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
                {t("legal.terms_notice")}
              </ThemedText>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.light.black}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <ThemedText style={styles.introText}>
                {t("legal.modal.intro")}
              </ThemedText>

              <ThemedText style={styles.sectionTitle}>
                {t("legal.modal.sections.1.title")}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {t("legal.modal.sections.1.body")}
              </ThemedText>

              <ThemedText style={styles.sectionTitle}>
                {t("legal.modal.sections.2.title")}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {t("legal.modal.sections.2.body")}
              </ThemedText>

              <ThemedText style={styles.sectionTitle}>
                {t("legal.modal.sections.3.title")}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {t("legal.modal.sections.3.body")}
              </ThemedText>

              <ThemedText style={styles.sectionTitle}>
                {t("legal.modal.sections.4.title")}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {t("legal.modal.sections.4.body")}
              </ThemedText>

              <ThemedText style={styles.sectionTitle}>
                {t("legal.modal.sections.5.title")}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {t("legal.modal.sections.5.body")}
              </ThemedText>

              <ThemedText style={styles.sectionTitle}>
                {t("legal.modal.sections.6.title")}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {t("legal.modal.sections.6.body")}
              </ThemedText>

              <ThemedText style={styles.warningText}>
                {t("legal.modal.warning")}
              </ThemedText>

              <View style={styles.spacer} />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <ThemedText style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                <ThemedText style={styles.acceptButtonText}>
                  {t("legal.accept_continue")}
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
