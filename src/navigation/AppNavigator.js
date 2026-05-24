import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import AddClothingScreen from "../screens/AddClothingScreen";
import CreateOutfitScreen from "../screens/CreateOutfitScreen";
import CollectionScreen from "../screens/CollectionScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import CategoryGalleryScreen from "../screens/CategoryGalleryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OtherUserProfileScreen from "../screens/OtherUserProfileScreen";
import ClothDetailScreen from "../screens/ClothDetailScreen";
import OutfitDetailScreen from "../screens/OutfitDetailScreen";
import FloatingTabBar from "../components/FloatingTabBar";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppTabs() {
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
      <Tab.Screen name="Kıyafet Ekle" component={AddClothingScreen} />
      <Tab.Screen name="Keşfet" component={DiscoverScreen} />
      <Tab.Screen name="Koleksiyon" component={CollectionScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
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

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="MainTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      </Stack.Group>

      {/* Modal screens for detail views */}
      <Stack.Group
        screenOptions={({ navigation }) => ({
          presentation: "card",
          animationEnabled: true,
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "800", color: "#2b2622" },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 14, paddingHorizontal: 8, paddingVertical: 4 }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ fontSize: 24, color: "#3f3a34", fontWeight: "800" }}>{"<"}</Text>
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen
          name="OtherUserProfile"
          component={OtherUserProfileScreen}
          options={{ title: "Profil" }}
        />
        <Stack.Screen
          name="ClothDetail"
          component={ClothDetailScreen}
          options={{ title: "Kıyafet Detayı" }}
        />
        <Stack.Screen
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={{ title: "Kombin Detayı" }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EAF7FF" }}>
        <ActivityIndicator size="large" color="#F89DAC" />
      </View>
    );
  }

  return isSignedIn ? <AppStack /> : <AuthStack />;
}
