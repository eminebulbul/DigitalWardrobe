import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
import theme from "../constants/theme";

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
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
        },
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
              style={{
                marginLeft: theme.spacing.sm,
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: theme.spacing.xs,
              }}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          );
        },
      })}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={CreateOutfitScreen}
        options={{
          tabBarLabel: "Ana Sayfa",
          headerTitle: "Kombin Shuffle",
        }}
      />

      <Tab.Screen
        name="Kıyafet Ekle"
        component={AddClothingScreen}
        options={{
          tabBarLabel: "Kıyafet Ekle",
          headerTitle: "Yeni Kıyafet Ekle",
        }}
      />

      <Tab.Screen
        name="Keşfet"
        component={DiscoverScreen}
        options={{
          tabBarLabel: "Keşfet",
          headerTitle: "Keşfet",
        }}
      />

      <Tab.Screen
        name="Dolap"
        component={CollectionScreen}
        options={{
          tabBarLabel: "Dolap",
          headerTitle: "Dolap",
        }}
      />

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
      <Stack.Group>
        <Stack.Screen
          name="MainTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      </Stack.Group>

      <Stack.Group
        screenOptions={({ navigation }) => ({
          presentation: "card",
          animationEnabled: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
          },
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={{
                marginLeft: theme.spacing.sm,
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: theme.spacing.xs,
              }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
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
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={{ title: "Kombin Detayı" }}
        />

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
        animationEnabled: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={({ navigation }) => ({
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginLeft: theme.spacing.sm,
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: theme.spacing.xs,
              }}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ),
        })}
      />
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return isSignedIn ? <AppStack /> : <AuthStack />;
}
