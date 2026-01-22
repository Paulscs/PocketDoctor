import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
    tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
    headerShown: false,
    tabBarButton: HapticTab,

    // 🔽 Baja todo el item
    tabBarItemStyle: {
      paddingTop:  4,
      paddingBottom: 10,   // <-- sube/baja icono + texto juntos
    },

    tabBarLabelStyle: {
      fontSize: 10,
      marginTop: 2,    // <-- baja SOLO el texto
    },

    tabBarStyle: {
      backgroundColor: Colors[colorScheme ?? "light"].card,
      borderTopColor: Colors[colorScheme ?? "light"].border,
      left: 20,
      right: 20,
      elevation: 5,
      borderRadius: 20,
      height: 60,
      borderTopWidth: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
    },
  }}
>

      <Tabs.Screen
  name="home"
  options={{
    title: "Inicio",
    
    // Agrega esto:
    tabBarLabelStyle: {
      fontSize: 10,      // Asegúrate de poner el mismo tamaño que en screenOptions
      fontWeight: '600', 
      marginLeft: 2,      // <--- AUMENTA este número para bajar el texto
            // marginBottom: 4 // <--- O usa esto para empujarlo hacia arriba
    },
    
    tabBarIcon: ({ color }) => (
      <IconSymbol size={25} name="house.fill" color={color} />
    ),
  }}
/>
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
           tabBarLabelStyle: {
      fontSize: 10,      // Asegúrate de poner el mismo tamaño que en screenOptions
      fontWeight: '600', 
      marginLeft: 2,      // <--- AUMENTA este número para bajar el texto
            // marginBottom: 4 // <--- O usa esto para empujarlo hacia arriba
    },
          tabBarIcon: ({ color }) => (
            <IconSymbol size={25} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clinics"
        options={{
          title: "Clínicas",
           tabBarLabelStyle: {
      fontSize: 10,      // Asegúrate de poner el mismo tamaño que en screenOptions
      fontWeight: '600', 
      marginLeft: 2,      // <--- AUMENTA este número para bajar el texto
            // marginBottom: 4 // <--- O usa esto para empujarlo hacia arriba
    },
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="building.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
           tabBarLabelStyle: {
      fontSize: 10,      // Asegúrate de poner el mismo tamaño que en screenOptions
      fontWeight: '600', 
      marginLeft: 2,      // <--- AUMENTA este número para bajar el texto
            // marginBottom: 4 // <--- O usa esto para empujarlo hacia arriba
    },
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
           tabBarLabelStyle: {
      fontSize: 10,      // Asegúrate de poner el mismo tamaño que en screenOptions
      fontWeight: '600', 
      marginLeft: 2,      // <--- AUMENTA este número para bajar el texto
            // marginBottom: 4 // <--- O usa esto para empujarlo hacia arriba
    },
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
