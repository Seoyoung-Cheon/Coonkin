import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const RecipeDetailScreen = ({ route }) => {
    const { recipe, selectedIngredients = [] } = route.params || {};

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

    // 재료 비교 함수 - 부족한 재료 찾기 (엄격한 검증)
    const checkIngredientAvailability = (ingredientName) => {
        if (selectedIngredients.length === 0) {
            return false; // 재료를 입력하지 않았으면 모두 부족한 것으로 표시
        }

        // 레시피 재료명에서 단어 추출 (쉼표, 공백으로 분리)
        const normalizedRecipeIngredient = ingredientName.toLowerCase().trim();
        const recipeWords = normalizedRecipeIngredient
            .split(/[,\s]+/)
            .map((word) => word.trim())
            .filter((word) => word.length > 0);

        // 사용자가 입력한 재료와 정확히 비교
        return selectedIngredients.some((selectedIngredient) => {
            const normalizedSelected = selectedIngredient.toLowerCase().trim();
            const selectedWords = normalizedSelected
                .split(/[,\s]+/)
                .map((word) => word.trim())
                .filter((word) => word.length > 0);

            // 1. 정확히 일치하는지 확인
            if (normalizedRecipeIngredient === normalizedSelected) {
                return true;
            }

            // 2. 단어 단위로 비교 (레시피 재료의 주요 단어가 사용자 입력과 일치하는지)
            // 예: "양파" 입력 시 "양파 1개"와 매칭
            const hasMatchingWord = recipeWords.some((recipeWord) => {
                return (
                    recipeWord === normalizedSelected ||
                    selectedWords.some(
                        (selectedWord) => recipeWord === selectedWord
                    )
                );
            });

            if (hasMatchingWord) {
                return true;
            }

            // 3. 사용자 입력이 레시피 재료명에 포함되어 있는지 (단어 경계 고려)
            // 예: "양파" 입력 시 "양파"가 포함된 재료와 매칭
            if (normalizedRecipeIngredient.includes(normalizedSelected)) {
                // 단어 경계 확인 (공백, 쉼표, 시작/끝)
                const regex = new RegExp(
                    `(^|[,\\s])${normalizedSelected.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    )}([,\\s]|$)`,
                    "i"
                );
                return regex.test(normalizedRecipeIngredient);
            }

            return false;
        });
    };

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
                            const hasIngredient =
                                checkIngredientAvailability(displayName);

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.ingredientRow,
                                        !hasIngredient &&
                                            styles.missingIngredientRow,
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            hasIngredient
                                                ? "checkmark-circle"
                                                : "close-circle"
                                        }
                                        size={20}
                                        color={
                                            hasIngredient
                                                ? "#4caf50"
                                                : "#f44336"
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.ingredientText,
                                            !hasIngredient &&
                                                styles.missingIngredientText,
                                        ]}
                                    >
                                        {displayName}
                                        {ingredient.amount &&
                                            ingredient.unit &&
                                            ` (${ingredient.amount} ${ingredient.unit})`}
                                    </Text>
                                    {!hasIngredient && (
                                        <View style={styles.missingBadge}>
                                            <Text
                                                style={styles.missingBadgeText}
                                            >
                                                필요
                                            </Text>
                                        </View>
                                    )}
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
        flex: 1,
    },
    missingIngredientRow: {
        backgroundColor: "#ffebee",
        borderWidth: 1,
        borderColor: "#f44336",
        borderStyle: "dashed",
    },
    missingIngredientText: {
        color: "#d32f2f",
        fontWeight: "600",
    },
    missingBadge: {
        backgroundColor: "#f44336",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    missingBadgeText: {
        color: "#fff",
        fontSize: 12,
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
