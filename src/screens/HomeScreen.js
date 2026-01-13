import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
    const handleCookPress = () => {
        navigation.navigate("RecipeSearch");
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={styles.content}>
                <Image
                    source={require("../../assets/logo (3).png")}
                    style={styles.logo}
                    tintColor="#645559"
                />
                <Text style={styles.title}>COOKIN에 오신 것을 환영합니다</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCookPress}
                >
                    <Ionicons
                        name="restaurant-outline"
                        size={24}
                        color="#fff"
                    />
                    <Text style={styles.buttonText}>요리하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffe6d8",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        bottom: 50,
    },
    title: {
        fontSize: 24,
        marginBottom: 32,
        textAlign: "center",
        color: "#56423d",
        fontFamily: "LeeSeoYun",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#645559",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
        fontFamily: "LeeSeoYun",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
        fontFamily: "LeeSeoYun",
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 32,
        resizeMode: "contain",
    },
});

export default HomeScreen;
