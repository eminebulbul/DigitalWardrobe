import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f4f2ed",
    card: "#ffffff",
    text: "#1e1b18",
    border: "#e6ded2",
    primary: "#2d6a5a",
  },
};

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}
