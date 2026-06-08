import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NavigationTabs from "./NavigationTabs";
import HomeScreen from "./src/screens/HomeScreen";
import DiseaseScreen from "./src/screens/DiseaseScreen";
import AssistantScreen from "./src/screens/AssistantScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import AuthModal from "./src/components/AuthModal";

const Tab = createBottomTabNavigator();

function CommunityScreenWithAuth() {
  return <CommunityScreen AuthModalComponent={AuthModal} />;
}

function AssistantScreenWithAuth() {
  return <AssistantScreen AuthModalComponent={AuthModal} />;
}

export default function AppTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <NavigationTabs {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="DiseaseScreen" component={DiseaseScreen} />
      <Tab.Screen name="AssistantScreen" component={AssistantScreenWithAuth} />
      <Tab.Screen name="CommunityScreen" component={CommunityScreenWithAuth} />
    </Tab.Navigator>
  );
}
