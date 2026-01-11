import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../services/ApiService";

const RecipeSearchScreen = ({ navigation }) => {
    const [ingredientText, setIngredientText] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recipeType, setRecipeType] = useState("western"); // "korean" or "western"

    const addIngredient = () => {
        const ingredient = ingredientText.trim();
        if (ingredient && !selectedIngredients.includes(ingredient)) {
            setSelectedIngredients([...selectedIngredients, ingredient]);
            setIngredientText("");
        }
    };

    const removeIngredient = (ingredient) => {
        setSelectedIngredients(
            selectedIngredients.filter((item) => item !== ingredient)
        );
    };

    const searchRecipes = async () => {
        if (selectedIngredients.length === 0) {
            Alert.alert("알림", "재료를 하나 이상 추가해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const apiService = new ApiService();
            let results = [];

            if (recipeType === "western") {
                // 양식 API 호출
                results = await apiService.searchRecipesByIngredients(
                    selectedIngredients
                );
            } else if (recipeType === "korean") {
                // 한식 API 호출
                results = await apiService.searchKoreanRecipesByIngredients(
                    selectedIngredients
                );
            }

            setRecipes(results);
        } catch (error) {
            Alert.alert(
                "오류",
                error.message || "레시피를 불러오는데 실패했습니다."
            );
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                <View style={styles.inputSection}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                recipeType === "korean" &&
                                    styles.toggleButtonActive,
                            ]}
                            onPress={() => setRecipeType("korean")}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    recipeType === "korean" &&
                                        styles.toggleButtonTextActive,
                                ]}
                            >
                                한식
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                recipeType === "western" &&
                                    styles.toggleButtonActive,
                            ]}
                            onPress={() => setRecipeType("western")}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    recipeType === "western" &&
                                        styles.toggleButtonTextActive,
                                ]}
                            >
                                양식
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionTitle}>
                        음식 재료를 입력하세요(
                        {recipeType === "korean" ? "한식" : "양식"})
                    </Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="예: 양파, 당근, 감자"
                            value={ingredientText}
                            onChangeText={setIngredientText}
                            onSubmitEditing={addIngredient}
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={addIngredient}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {selectedIngredients.length > 0 && (
                        <>
                            <Text style={styles.label}>선택한 재료:</Text>
                            <View style={styles.chipContainer}>
                                {selectedIngredients.map(
                                    (ingredient, index) => (
                                        <View key={index} style={styles.chip}>
                                            <Text style={styles.chipText}>
                                                {ingredient}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    removeIngredient(ingredient)
                                                }
                                            >
                                                <Ionicons
                                                    name="close-circle"
                                                    size={18}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )
                                )}
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.searchButton,
                                    isLoading && styles.disabledButton,
                                ]}
                                onPress={searchRecipes}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.searchButtonContent}>
                                        <Ionicons
                                            name="search-outline"
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.searchButtonText}>
                                            레시피 찾기
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff6b35" />
                        <Text style={styles.loadingText}>
                            레시피를 찾고 있어요...
                        </Text>
                    </View>
                )}

                {!isLoading && recipes.length > 0 && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>검색 결과</Text>
                        {recipes.map((recipe, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.recipeCard}
                                onPress={() => {
                                    navigation.navigate("RecipeDetail", {
                                        recipe,
                                    });
                                }}
                            >
                                {recipe.imageUrl && (
                                    <Image
                                        source={{ uri: recipe.imageUrl }}
                                        style={styles.recipeImage}
                                        resizeMode="cover"
                                    />
                                )}
                                <View style={styles.recipeContent}>
                                    <Text style={styles.recipeTitle}>
                                        {recipe.translatedTitle || recipe.title}
                                    </Text>
                                    {(recipe.translatedDescription ||
                                        recipe.description) && (
                                        <Text
                                            style={styles.recipeDescription}
                                            numberOfLines={2}
                                        >
                                            {recipe.translatedDescription ||
                                                recipe.description}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {!isLoading &&
                    recipes.length === 0 &&
                    selectedIngredients.length > 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                레시피를 찾을 수 없습니다.
                            </Text>
                        </View>
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
    inputSection: {
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: "row",
        marginBottom: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    toggleButtonActive: {
        backgroundColor: "#ff6b35",
    },
    toggleButtonText: {
        fontSize: 16,
        color: "#666",
        fontFamily: "LeeSeoYun",
    },
    toggleButtonTextActive: {
        color: "#fff",
        fontFamily: "LeeSeoYun",
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 12,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    inputRow: {
        flexDirection: "row",
        marginBottom: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        fontFamily: "LeeSeoYun",
    },
    addButton: {
        backgroundColor: "#ff6b35",
        borderRadius: 8,
        padding: 12,
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 8,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff3e0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 14,
        marginRight: 4,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    searchButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff6b35",
        paddingVertical: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    searchButtonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
        fontFamily: "LeeSeoYun",
    },
    disabledButton: {
        opacity: 0.6,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
        fontFamily: "LeeSeoYun",
    },
    resultsSection: {
        marginTop: 24,
    },
    resultsTitle: {
        fontSize: 20,
        marginBottom: 16,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    recipeCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    recipeImage: {
        width: "100%",
        height: 200,
        backgroundColor: "#f0f0f0",
    },
    recipeContent: {
        padding: 16,
    },
    recipeTitle: {
        fontSize: 18,
        marginBottom: 8,
        color: "#333",
        fontFamily: "LeeSeoYun",
    },
    recipeDescription: {
        fontSize: 14,
        color: "#666",
        fontFamily: "LeeSeoYun",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        fontFamily: "LeeSeoYun",
    },
});

export default RecipeSearchScreen;
