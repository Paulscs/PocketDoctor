import React from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Interface matching the one in clinics.tsx
export interface Clinic {
    id: string;
    name: string;
    fullName: string;
    address: string;
    mapCode: string;
    // Extra props that might be in the parent's Clinic type, made optional or included to allow compatibility
    specialties?: string[];
    image?: string;
    rating?: number;
    phone?: string;
    website?: string;
}

interface ClinicsMapProps {
    clinics: Clinic[];
    onClinicPress?: (clinic: Clinic) => void;
}

const parseLocation = (geoString: string): { latitude: number; longitude: number } | null => {
    if (!geoString) return null;
    // Handle format "(18.4861,-69.9312)"
    const match = geoString.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { latitude: lat, longitude: lng };
        }
    }
    return null;
};

export const ClinicsMap: React.FC<ClinicsMapProps> = ({ clinics, onClinicPress }) => {
    // Default region (Santo Domingo aprox)
    const initialRegion = {
        latitude: 18.4861,
        longitude: -69.9312,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {clinics.map((clinic) => {
                    const coordinate = parseLocation(clinic.mapCode);
                    if (!coordinate) return null;

                    return (
                        <Marker
                            key={clinic.id}
                            coordinate={coordinate}
                            title={clinic.name}
                            description={clinic.address}
                            onCalloutPress={() => onClinicPress && onClinicPress(clinic)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerIcon}>
                                    <Ionicons name="medical" size={16} color="white" />
                                </View>
                                <View style={styles.markerArrow} />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 20,
        height: 500, // Explicit height for ScrollView compatibility or flex:1 if parent allows
        backgroundColor: Colors.light.lightGray,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerIcon: {
        backgroundColor: Colors.light.brandBlue,
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Colors.light.brandBlue,
        marginTop: -2,
    },
});
