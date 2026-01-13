import React, { useState, useRef } from "react";
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
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../services/ApiService";

const RecipeSearchScreen = ({ navigation }) => {
    const [ingredientText, setIngredientText] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recipeType, setRecipeType] = useState("korean"); // "korean" or "western"
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const inputRef = useRef(null);

    const addIngredient = () => {
        const ingredient = ingredientText.trim();
        if (ingredient && !selectedIngredients.includes(ingredient)) {
            setSelectedIngredients([...selectedIngredients, ingredient]);
            setIngredientText("");
            // 키보드 닫기
            Keyboard.dismiss();
            // TextInput 포커스 해제
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const removeIngredient = (ingredient) => {
        setSelectedIngredients(
            selectedIngredients.filter((item) => item !== ingredient)
        );
    };

    const resetSearchState = () => {
        setRecipes([]);
        setIngredientText("");
        setSelectedIngredients([]);
        setIsLoading(false);
        setCurrentPage(1);
    };

    const handleRecipeTypeChange = (type) => {
        if (recipeType !== type) {
            resetSearchState();
            setRecipeType(type);
        }
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
            setCurrentPage(1); // 검색 시 첫 페이지로 리셋
        } catch (error) {
            Alert.alert(
                "오류",
                error.message || "레시피를 불러오는데 실패했습니다."
            );
            setRecipes([]);
            setCurrentPage(1);
        } finally {
            setIsLoading(false);
        }
    };

    // 한식 재료명 동의어 매핑
    const ingredientSynonyms = {
        소고기: ["쇠고기", "소고기", "소고기살"],
        쇠고기: ["소고기", "쇠고기", "소고기살"],
        양파: ["양파", "양파(중간)", "양파(작은)"],
        당근: ["당근", "당근(중간)", "당근(작은)"],
        감자: ["감자", "감자(중간)", "감자(작은)"],
    };

    // 재료명 정규화 (동의어 처리 포함)
    const normalizeIngredientName = (name) => {
        let normalized = name.toLowerCase().trim();

        // 동의어 처리
        for (const [key, synonyms] of Object.entries(ingredientSynonyms)) {
            if (
                synonyms.some((syn) => normalized.includes(syn.toLowerCase()))
            ) {
                normalized = key.toLowerCase();
                break;
            }
        }

        // 괄호, 숫자, 단위 제거
        normalized = normalized
            .replace(/\([^)]*\)/g, "") // 괄호 내용 제거
            .replace(/\d+[가-힣a-zA-Z\/]*/g, "") // 숫자+단위 제거 (예: "1/2개", "200g")
            .replace(/[가-힣a-zA-Z]*\d+/g, "") // 단위+숫자 제거
            .trim();

        return normalized;
    };

    // 재료 매칭 확인 함수 (재사용)
    const isIngredientMatched = (recipeIngredientName, selectedIngredient) => {
        const normalizedRecipe = normalizeIngredientName(recipeIngredientName);
        const normalizedSelected = normalizeIngredientName(selectedIngredient);

        // 1. 정확히 일치하는지 확인
        if (normalizedRecipe === normalizedSelected) {
            return true;
        }

        // 2. 서로 포함 관계인지 확인 (단어 경계 고려)
        if (normalizedRecipe.includes(normalizedSelected)) {
            const regex = new RegExp(
                `(^|[^가-힣a-zA-Z])${normalizedSelected.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )}([^가-힣a-zA-Z]|$)`,
                "i"
            );
            return regex.test(normalizedRecipe);
        }

        if (normalizedSelected.includes(normalizedRecipe)) {
            const regex = new RegExp(
                `(^|[^가-힣a-zA-Z])${normalizedRecipe.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )}([^가-힣a-zA-Z]|$)`,
                "i"
            );
            return regex.test(normalizedSelected);
        }

        return false;
    };

    // 사용자가 입력한 모든 재료가 레시피에 포함되어 있는지 확인
    const hasAllSelectedIngredients = (recipe, index = 0) => {
        if (!selectedIngredients || selectedIngredients.length === 0) {
            return false;
        }

        const recipeIngredients =
            recipe.translatedIngredients || recipe.ingredients || [];

        if (recipeIngredients.length === 0) {
            if (index < 3) {
                console.log("⚠️ 레시피 재료가 없습니다:", recipe.title);
            }
            return false;
        }

        // 디버깅: 처음 3개 레시피만 상세 로그
        const shouldLog = index < 3;
        if (shouldLog) {
            console.log(`🔍 [${index + 1}] 레시피:`, recipe.title);
            console.log(
                "📝 레시피 재료:",
                recipeIngredients
                    .map(
                        (i) =>
                            i.name || i.translatedName || i.originalName || ""
                    )
                    .join(", ")
            );
            console.log("✅ 사용자 입력 재료:", selectedIngredients.join(", "));
        }

        // 사용자가 입력한 각 재료가 레시피에 포함되어 있는지 확인
        const allMatched = selectedIngredients.every((selectedIngredient) => {
            const matched = recipeIngredients.some((ingredient) => {
                const ingredientName =
                    ingredient.translatedName ||
                    ingredient.name ||
                    ingredient.originalName ||
                    "";
                const isMatched = isIngredientMatched(
                    ingredientName,
                    selectedIngredient
                );
                if (isMatched && shouldLog) {
                    console.log(
                        `  ✅ 매칭: "${selectedIngredient}" <-> "${ingredientName}"`
                    );
                }
                return isMatched;
            });
            if (!matched && shouldLog) {
                console.log(
                    `  ❌ 매칭 실패: "${selectedIngredient}"을(를) 찾을 수 없습니다.`
                );
            }
            return matched;
        });

        if (shouldLog) {
            console.log(
                allMatched ? "✅ 모든 재료 매칭 성공" : "❌ 일부 재료 매칭 실패"
            );
            console.log("---");
        }
        return allMatched;
    };

    // 매칭률 계산 함수 (보유한 재료 수 / 전체 필요한 재료 수 * 100)
    const calculateMatchRate = (recipe) => {
        if (!selectedIngredients || selectedIngredients.length === 0) {
            return 0; // 재료를 입력하지 않았으면 매칭률 0%
        }

        const recipeIngredients =
            recipe.translatedIngredients || recipe.ingredients || [];

        if (recipeIngredients.length === 0) {
            return 0; // 레시피에 재료 정보가 없으면 매칭률 0%
        }

        let matchedCount = 0;

        recipeIngredients.forEach((ingredient) => {
            const ingredientName =
                ingredient.translatedName ||
                ingredient.name ||
                ingredient.originalName ||
                "";

            const hasIngredient = selectedIngredients.some(
                (selectedIngredient) => {
                    return isIngredientMatched(
                        ingredientName,
                        selectedIngredient
                    );
                }
            );

            if (hasIngredient) {
                matchedCount++;
            }
        });

        // 매칭률 계산 (보유한 재료 수 / 전체 필요한 재료 수 * 100)
        const matchRate = (matchedCount / recipeIngredients.length) * 100;
        return Math.round(matchRate * 100) / 100; // 소수점 둘째 자리까지
    };

    // 사용자가 입력한 모든 재료를 사용하는 레시피만 필터링하고 매칭률 순으로 정렬
    const filteredRecipes = recipes
        .map((recipe, index) => ({
            recipe,
            index,
        }))
        .filter(({ recipe, index }) => hasAllSelectedIngredients(recipe, index)) // 사용자가 입력한 재료를 모두 사용하는 레시피만
        .map(({ recipe }) => ({
            ...recipe,
            matchRate: calculateMatchRate(recipe),
        }))
        .sort((a, b) => b.matchRate - a.matchRate); // 매칭률 높은 순으로 정렬

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecipes = filteredRecipes.slice(startIndex, endIndex);
    const hasNextPage = currentPage < totalPages;

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(currentPage + 1);
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
                            onPress={() => handleRecipeTypeChange("korean")}
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
                            onPress={() => handleRecipeTypeChange("western")}
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
                            ref={inputRef}
                            style={styles.input}
                            placeholder="예: 양파, 당근, 감자"
                            value={ingredientText}
                            onChangeText={setIngredientText}
                            onSubmitEditing={addIngredient}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={addIngredient}
                            activeOpacity={0.7}
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

                {!isLoading && filteredRecipes.length > 0 && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>
                            검색 결과 ({filteredRecipes.length}개)
                        </Text>
                        {currentRecipes.map((recipe, index) => (
                            <TouchableOpacity
                                key={startIndex + index}
                                style={styles.recipeCard}
                                onPress={() => {
                                    navigation.navigate("RecipeDetail", {
                                        recipe,
                                        selectedIngredients,
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
                        {hasNextPage && (
                            <TouchableOpacity
                                style={styles.nextPageButton}
                                onPress={handleNextPage}
                            >
                                <Text style={styles.nextPageButtonText}>
                                    다음 페이지 ({currentPage + 1}/{totalPages})
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        )}
                        {totalPages > 1 && (
                            <Text style={styles.pageInfo}>
                                {currentPage} / {totalPages} 페이지
                            </Text>
                        )}
                    </View>
                )}

                {!isLoading &&
                    filteredRecipes.length === 0 &&
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
        backgroundColor: "#ffe6d8",
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
        backgroundColor: "#645559",
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
        backgroundColor: "#645559",
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
        backgroundColor: "#645559",
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
    nextPageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff6b35",
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 8,
    },
    nextPageButtonText: {
        color: "#fff",
        fontSize: 16,
        marginRight: 8,
        fontFamily: "LeeSeoYun",
    },
    pageInfo: {
        textAlign: "center",
        fontSize: 14,
        color: "#666",
        marginTop: 8,
        fontFamily: "LeeSeoYun",
    },
});

export default RecipeSearchScreen;
