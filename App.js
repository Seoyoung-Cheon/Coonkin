import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import HomeScreen from "./src/screens/HomeScreen";
import RecipeSearchScreen from "./src/screens/RecipeSearchScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(true);

    useEffect(() => {
        async function loadFonts() {
            try {
                await Font.loadAsync({
                    LeeSeoYun: require("./assets/Leeseoyun.ttf"),
                });
            } catch (error) {
                console.log("폰트 로드 실패 (무시됨):", error.message);
            } finally {
                setFontsLoaded(true);
            }
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#ffe6d8",
                    },
                    headerTintColor: "#56423d",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerTitleStyle: {
                        fontFamily: "LeeSeoYun",
                    },
                    contentStyle: {
                        backgroundColor: "#FFF8F6",
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: "COOKIN",
                    }}
                />
                <Stack.Screen
                    name="RecipeSearch"
                    component={RecipeSearchScreen}
                    options={{
                        title: "레시피 찾기",
                    }}
                />
                <Stack.Screen
                    name="RecipeDetail"
                    component={RecipeDetailScreen}
                    options={{
                        title: "레시피 상세",
                    }}
                />
            </Stack.Navigator>
            <StatusBar style="dark" />
        </NavigationContainer>
    );
}
