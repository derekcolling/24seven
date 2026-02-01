import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Outfit_700Bold, Outfit_400Regular } from '@expo-google-fonts/outfit';

// Reference implementation of the style
export const HealthTheme = {
    background: '#F9F6ED',
    text: '#1C1C1C',
    accent: '#FAB7D3',
    radius: 24,
};

export const PremiumButton = ({ title, onPress }: { title: string, onPress: () => void }) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: HealthTheme.text }]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Outfit_600SemiBold',
    },
});
