import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#EAF7FF",
    card: "#ffffff",
    text: "#1e1b18",
    border: "#CFE8F7",
    primary: "#F89DAC",
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
