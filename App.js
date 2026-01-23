// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppTabs from "./AppTabs";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SafeAreaView style={{ flex: 1, paddingTop: 5 }}>
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
