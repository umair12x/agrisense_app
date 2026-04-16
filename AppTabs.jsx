// AppTabs.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NavigationTabs from "./NavigationTabs";
import HomeScreen from "./src/screens/HomeScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import DiseaseScreen from "./src/screens/DiseaseScreen";
import SoilScreen from "./src/screens/SoilScreen";
import AssistantScreen from "./src/screens/AssistantScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import AuthModal from "./src/components/AuthModal";

const Tab = createBottomTabNavigator();

// Wrapper component to pass AuthModal to CommunityScreen
function CommunityScreenWithAuth() {
  return <CommunityScreen AuthModalComponent={AuthModal} />;
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <NavigationTabs {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="DashboardScreen" component={DashboardScreen} />
      <Tab.Screen name="DiseaseScreen" component={DiseaseScreen} />
      <Tab.Screen name="SoilScreen" component={SoilScreen} />
      <Tab.Screen name="AssistantScreen" component={AssistantScreen} />
      <Tab.Screen name="CommunityScreen" component={CommunityScreenWithAuth} />
    </Tab.Navigator>
  );
}