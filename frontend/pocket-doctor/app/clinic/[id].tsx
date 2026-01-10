
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { getClinicById, Centro, EspecialistaCentro } from '@/src/services/clinics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ClinicDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [clinic, setClinic] = useState<Centro | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const session = useAuthStore((state) => state.session);
    const accessToken = session?.access_token;

    const bgColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        async function loadClinic() {
            if (!id || !accessToken) return;
            try {
                setLoading(true);
                const data = await getClinicById(Number(id), accessToken);
                setClinic(data);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar la información de la clínica.');
            } finally {
                setLoading(false);
            }
        }
        loadClinic();
    }, [id, accessToken]);

    const handleCall = () => {
        if (clinic?.telefono) {
            Linking.openURL(`tel:${clinic.telefono.replace(/\D/g, '')}`);
        }
    };

    const handleMap = () => {
        if (clinic?.ubicacion_geografica) {
            // Parse "(lat,lng)"
            const clean = clinic.ubicacion_geografica.replace(/[()]/g, '');
            const [lat, lng] = clean.split(',');
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.light.brandBlue} />
            </View>
        );
    }

    if (error || !clinic) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={48} color={Colors.light.warning} />
                <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>{error || 'Clínica no encontrada'}</ThemedText>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <ThemedText style={{ color: Colors.light.brandBlue }}>Volver</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: clinic.nombre, headerBackTitle: 'Atrás' }} />
            <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Header Image Placeholder */}
                <View style={styles.headerImageContainer}>
                    <View style={styles.placeholderImage}>
                        <Ionicons name="medical" size={48} color={Colors.light.white} />
                    </View>
                </View>

                <View style={styles.content}>
                    <ThemedText type="title">{clinic.nombre}</ThemedText>

                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={20} color={Colors.light.textGray} />
                        <ThemedText style={styles.infoText}>
                            {[clinic.direccion, clinic.ciudad, clinic.provincia].filter(Boolean).join(', ')}
                        </ThemedText>
                    </View>

                    {clinic.telefono && (
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color={Colors.light.textGray} />
                            <ThemedText style={styles.infoText}>{clinic.telefono}</ThemedText>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.actionButton, styles.primaryBtn]} onPress={handleCall}>
                            <Ionicons name="call" size={20} color="white" />
                            <ThemedText style={styles.btnText}>Llamar</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.secondaryBtn]} onPress={handleMap}>
                            <Ionicons name="map" size={20} color={Colors.light.brandBlue} />
                            <ThemedText style={[styles.btnText, { color: Colors.light.brandBlue }]}>Cómo llegar</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Specialists Section */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Especialistas Disponibles</ThemedText>

                    {clinic.especialistas && clinic.especialistas.length > 0 ? (
                        <View style={styles.specialistList}>
                            {clinic.especialistas.map((esp) => (
                                <View key={esp.especialista_id} style={styles.specialistCard}>
                                    <View style={styles.specialistIcon}>
                                        <Ionicons name="person" size={20} color={Colors.light.brandBlue} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={styles.specialistName}>
                                            {esp.nombre} {esp.apellido}
                                        </ThemedText>
                                        <ThemedText style={styles.specialistRole}>
                                            {esp.especialidad?.join(', ') || 'Especialista'}
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <ThemedText style={{ color: Colors.light.textGray, fontStyle: 'italic' }}>
                            No hay información detallada de especialistas.
                        </ThemedText>
                    )}

                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerImageContainer: {
        height: 150,
        backgroundColor: Colors.light.brandBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.lg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: Colors.light.background, // Should match theme
        marginTop: -20,
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    infoText: {
        fontSize: 14,
        color: Colors.light.textGray,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: BorderRadius.circle,
        gap: 8,
    },
    primaryBtn: {
        backgroundColor: Colors.light.brandBlue,
    },
    secondaryBtn: {
        backgroundColor: Colors.light.white,
        borderWidth: 1,
        borderColor: Colors.light.brandBlue,
    },
    btnText: {
        fontWeight: '600',
        color: 'white',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.light.border,
        marginVertical: Spacing.lg,
    },
    specialistList: {
        gap: Spacing.sm,
    },
    specialistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        gap: Spacing.md,
    },
    specialistIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD', // Light blue
        justifyContent: 'center',
        alignItems: 'center',
    },
    specialistName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    specialistRole: {
        fontSize: 14,
        color: Colors.light.textGray,
    },
});
