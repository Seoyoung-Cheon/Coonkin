import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const RecipeDetailScreen = ({ route }) => {
    const { recipe } = route.params || {};

    if (!recipe) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        레시피 정보를 불러올 수 없습니다.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                {recipe.imageUrl && (
                    <Image
                        source={{ uri: recipe.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
                <Text style={styles.title}>
                    {recipe.translatedTitle || recipe.title}
                </Text>
                {(recipe.translatedDescription || recipe.description) && (
                    <Text style={styles.description}>
                        {recipe.translatedDescription || recipe.description}
                    </Text>
                )}
                <View style={styles.infoRow}>
                    {recipe.cookingTime && (
                        <View style={styles.infoChip}>
                            <Ionicons
                                name="time-outline"
                                size={18}
                                color="#666"
                            />
                            <Text style={styles.infoText}>
                                예상시간: {recipe.cookingTime}분
                            </Text>
                        </View>
                    )}
                </View>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>필요한 재료</Text>
                        {(
                            recipe.translatedIngredients || recipe.ingredients
                        ).map((ingredient, index) => {
                            const displayName =
                                ingredient.translatedName || ingredient.name;
                            return (
                                <View key={index} style={styles.ingredientRow}>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={20}
                                        color="#4caf50"
                                    />
                                    <Text style={styles.ingredientText}>
                                        {displayName}
                                        {ingredient.amount &&
                                            ingredient.unit &&
                                            ` (${ingredient.amount} ${ingredient.unit})`}
                                    </Text>
                                </View>
                            );
                        })}
                    </>
                )}
                {recipe.steps && recipe.steps.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>조리 방법</Text>
                        {(recipe.translatedSteps || recipe.steps).map(
                            (step, index) => (
                                <View key={index} style={styles.stepRow}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>
                                            {index + 1}
                                        </Text>
                                    </View>
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            )
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8F6",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 8,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 16,
        lineHeight: 24,
        fontFamily: "LeeSeoYun",
    },
    infoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 24,
    },
    infoChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 4,
        fontFamily: "LeeSeoYun",
    },
    sectionTitle: {
        fontSize: 20,
        marginTop: 24,
        marginBottom: 12,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    ingredientRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
    },
    ingredientText: {
        fontSize: 16,
        marginLeft: 8,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    stepRow: {
        flexDirection: "row",
        marginBottom: 16,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ff6b35",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    stepNumberText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "LeeSeoYun",
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
});

export default RecipeDetailScreen;
