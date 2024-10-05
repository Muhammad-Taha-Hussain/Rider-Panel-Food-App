// screens/Navigation.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Import your screen components
import HomeScreen from "../screens/HomeScreen";
// import FontsScreen from '../screens/FontsScreen';
import NotificationScreen from "../screens/NotificationScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ExploreScreen from "../screens/ExploreScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: string;

            switch (route.name) {
              case "Home":
                iconName = "home-outline";
                break;
              case "Fonts":
                iconName = "text-outline";
                break;
              case "Notification":
                iconName = "notifications-outline";
                break;
              case "Profile":
                iconName = "person-outline";
                break;
              case "Explore":
                iconName = "compass-outline";
                break;
              default:
                iconName = "home-outline";
            }

            // Ensure the iconName is passed with a type assertion to prevent TypeScript errors
            return (
              <Ionicons
                name={iconName as keyof typeof Ionicons.glyphMap}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveBackgroundColor: "#157759",
          tabBarInactiveBackgroundColor: "#53ab8b",
          tabBarActiveTintColor: "#eafff9",
          tabBarInactiveTintColor: "#a2fdd9",
          headerShown: true,
          headerPressColor: "#a2fdd9",
          headerTintColor: "#157759",
          headerStatusBarHeight: 5,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: "",
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            headerTitle: "",
            headerStatusBarHeight: -20,
            headerStyle: {
              backgroundColor: "#a2fdd9", // Global header background color for all screens
            },
          }}
        />
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            headerTitle: "",
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerTitle: "",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
