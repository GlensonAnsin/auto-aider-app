import { Tabs } from "expo-router";
import { View } from "react-native";
import NotificationIcon from "../../../assets/images/ion_notifications.svg";
import SettingsIcon from "../../../assets/images/material-symbols_settings.svg";
import HomeIcon from "../../../assets/images/typcn_home.svg";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#000B58",
          height: 60,
          paddingHorizontal: 10,
          paddingTop: 10,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <HomeIcon width={30} height={30} color="#fff" />
            </View>
          ),
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: () => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <NotificationIcon width={30} height={30} color="#fff" />
            </View>
          ),
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: () => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <SettingsIcon width={30} height={30} color="#fff" />
            </View>
          ),
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="(profile)/profile"
        options={{
          title: "Profile",
          href: null,
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="(profile)/edit-profile"
        options={{
          title: "Edit Profile",
          href: null,
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="(profile)/manage-vehicles"
        options={{
          title: "Manage Vehicles",
          href: null,
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="(diagnostic-history)/diagnostic-history"
        options={{
          title: "History",
          href: null,
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="(run-diagnostics)/run-diagnostics"
        options={{
          title: "Diagnose",
          href: null,
          animation: "none",
        }}
      />
      <Tabs.Screen
        name="(run-diagnostics)/diagnosis"
        options={{
          title: "Diagnosis",
          href: null,
          animation: "none",
        }}
      />
    </Tabs>
  );
}
