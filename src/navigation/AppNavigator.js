import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

// Screens
import CreateOutfitScreen from "../screens/CreateOutfitScreen";
import AddClothingScreen from "../screens/AddClothingScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import CollectionScreen from "../screens/CollectionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OtherUserProfileScreen from "../screens/OtherUserProfileScreen";
import ClothDetailScreen from "../screens/ClothDetailScreen";
import OutfitDetailScreen from "../screens/OutfitDetailScreen";

// Components
import FloatingTabBar from "../components/FloatingTabBar";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * MAIN TABS - 5 sekmeli bottom navigation (soldan sağa):
 * 1. Ana Sayfa (Shuffle/Kombin Oluştur)
 * 2. Kıyafet Ekle
 * 3. Keşfet (Social Feed - is_shared kombinleri)
 * 4. Dolap (Wardrobe - Kıyafetler/Kombinlerim/Kaydedilenler)
 * 5. Profil
 */
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
      {/* 1. Ana Sayfa - Shuffle/Kombin Oluştur */}
      <Tab.Screen
        name="Ana Sayfa"
        component={CreateOutfitScreen}
        options={{
          tabBarLabel: "Ana Sayfa",
          headerTitle: "Kombin Shuffle",
        }}
      />

      {/* 2. Kıyafet Ekle */}
      <Tab.Screen
        name="Kıyafet Ekle"
        component={AddClothingScreen}
        options={{
          tabBarLabel: "Kıyafet Ekle",
          headerTitle: "Yeni Kıyafet Ekle",
        }}
      />

      {/* 3. Keşfet (Discover - Sosyal Feed) */}
      <Tab.Screen
        name="Keşfet"
        component={DiscoverScreen}
        options={{
          tabBarLabel: "Keşfet",
          headerTitle: "Keşfet",
        }}
      />

      {/* 4. Dolap (Wardrobe) - İçinde 3 Top Tab sekme olacak */}
      <Tab.Screen
        name="Dolap"
        component={CollectionScreen}
        options={{
          tabBarLabel: "Dolap",
          headerTitle: "Dolap",
        }}
      />

      {/* 5. Profil */}
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          headerTitle: "Profil",
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * AUTHENTICATED USER STACK
 * - MainTabs (5 bottom tabs)
 * - Modal Screens (OtherUserProfile, OutfitDetail, ClothDetail)
 */
function AppStack() {
  return (
    <Stack.Navigator>
      {/* Main Tab Navigator */}
      <Stack.Group>
        <Stack.Screen
          name="MainTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      </Stack.Group>

      {/* Modal Screens - Başkasının profili, Kombin detayı, Kıyafet detayı */}
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
        {/* Başka bir kullanıcının profilini görmek için */}
        <Stack.Screen
          name="OtherUserProfile"
          component={OtherUserProfileScreen}
          options={{ title: "Profil" }}
        />

        {/* Kombin detay sayfası (Keşfet'ten tıklandığında) */}
        <Stack.Screen
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={{ title: "Kombin Detayı" }}
        />

        {/* Kıyafet detay sayfası */}
        <Stack.Screen
          name="ClothDetail"
          component={ClothDetailScreen}
          options={{ title: "Kıyafet Detayı" }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * AUTH STACK - Login ve Register ekranları
 */
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

/**
 * ROOT NAVIGATOR - Auth durumuna göre AppStack veya AuthStack göster
 */
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
