import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, Text } from "react-native";
import AddClothingScreen from "../screens/AddClothingScreen";
import CreateOutfitScreen from "../screens/CreateOutfitScreen";
import CollectionScreen from "../screens/CollectionScreen";
import CategoryGalleryScreen from "../screens/CategoryGalleryScreen";
import FloatingTabBar from "../components/FloatingTabBar";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} variant="folder" />}
      screenOptions={({ navigation, route }) => ({
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "800", color: "#2b2622" },
        headerTitleAlign: "center",
        headerLeft: () => {
          const isHome = route.name === "Ana Sayfa";
          if (isHome) {
            return null;
          }

          return (
            <TouchableOpacity
              onPress={() => {
                if (route.name === "Kategori Galerisi") {
                  navigation.navigate("Koleksiyon");
                  return;
                }
                if (navigation.canGoBack()) {
                  navigation.goBack();
                  return;
                }
                navigation.navigate("Ana Sayfa");
              }}
              style={{ marginLeft: 14, paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 24, color: "#3f3a34", fontWeight: "800" }}>{"<"}</Text>
            </TouchableOpacity>
          );
        },
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={CreateOutfitScreen} />
      <Tab.Screen name="Kiyafet Ekle" component={AddClothingScreen} />
      <Tab.Screen name="Koleksiyon" component={CollectionScreen} />
      <Tab.Screen
        name="Kategori Galerisi"
        component={CategoryGalleryScreen}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: "none" },
          headerTitle: "Kategori Galerisi",
        }}
      />
    </Tab.Navigator>
  );
}
