import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation();

    const changeLanguage = async (lang: string) => {
        await i18n.changeLanguage(lang);
        try {
            await AsyncStorage.setItem('lang', lang);
        } catch (e) {
            console.error('Failed to save language', e);
        }
    };

    const currentLang = i18n.language; // or i18n.resolvedLanguage

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('language.select')}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        (currentLang === 'es' || currentLang.startsWith('es')) && styles.activeButton,
                    ]}
                    onPress={() => changeLanguage('es')}
                    accessibilityRole="button"
                    accessibilityLabel="Cambiar a Español"
                    accessibilityState={{ selected: currentLang.startsWith('es') }}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            (currentLang === 'es' || currentLang.startsWith('es')) && styles.activeButtonText,
                        ]}
                    >
                        ES
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        (currentLang === 'en' || currentLang.startsWith('en')) && styles.activeButton,
                    ]}
                    onPress={() => changeLanguage('en')}
                    accessibilityRole="button"
                    accessibilityLabel="Change to English"
                    accessibilityState={{ selected: currentLang.startsWith('en') }}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            (currentLang === 'en' || currentLang.startsWith('en')) && styles.activeButtonText,
                        ]}
                    >
                        EN
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginRight: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 2,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 18,
    },
    activeButton: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
    },
    activeButtonText: {
        color: '#000',
    },
});
