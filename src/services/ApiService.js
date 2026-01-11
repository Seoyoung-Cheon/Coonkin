import axios from "axios";
import { ApiConstants } from "../utils/constants";
import IngredientTranslator from "../utils/ingredientTranslator";
import TranslationService from "./TranslationService";

class ApiService {
    constructor() {
        this.baseUrl = ApiConstants.spoonacularBaseUrl;
        this.apiKey = ApiConstants.spoonacularApiKey;
        this.koreanRecipeBaseUrl = ApiConstants.koreanRecipeBaseUrl;
        this.koreanRecipeApiKey = ApiConstants.koreanRecipeApiKey;
    }

    // 재료로 레시피 검색
    async searchRecipesByIngredients(ingredientNames) {
        try {
            console.log("🔍 검색할 재료 (한글):", ingredientNames);

            // 한글 재료명을 영어로 변환
            const englishNames =
                IngredientTranslator.translateList(ingredientNames);
            console.log("🌐 변환된 재료 (영어):", englishNames);

            // 재료 이름들을 쉼표로 구분하여 연결
            const ingredientsString = englishNames
                .map((name) => encodeURIComponent(name.trim()))
                .join(",");

            const url = `${this.baseUrl}/recipes/findByIngredients?ingredients=${ingredientsString}&apiKey=${this.apiKey}&number=10`;

            console.log("📡 API 호출 URL:", url);

            const response = await axios.get(url);

            console.log("✅ API 응답 상태:", response.status);
            console.log("📦 API 응답 데이터:", response.data);

            if (response.status === 200) {
                const data = response.data;

                if (!Array.isArray(data)) {
                    console.log("❌ 응답이 배열이 아닙니다:", typeof data);
                    throw new Error("API 응답 형식이 올바르지 않습니다.");
                }

                if (data.length === 0) {
                    console.log("⚠️ 검색 결과가 없습니다.");
                    throw new Error(
                        "검색 결과가 없습니다. 다른 재료를 시도해보세요."
                    );
                }

                console.log(`✅ ${data.length}개의 레시피를 찾았습니다.`);

                // 레시피 상세 정보 가져오기 및 번역
                const recipes = [];
                const maxRecipes = Math.min(data.length, 10);
                const translationService = new TranslationService();

                for (let i = 0; i < maxRecipes; i++) {
                    const item = data[i];
                    try {
                        console.log(
                            `📖 레시피 ${
                                i + 1
                            }/${maxRecipes} 상세 정보 가져오는 중: ${item.id}`
                        );
                        const recipeDetail = await this.getRecipeDetail(
                            item.id
                        );
                        if (recipeDetail) {
                            // 제목과 설명 번역
                            console.log(
                                `🌐 레시피 번역 중: ${recipeDetail.title}`
                            );
                            recipeDetail.translatedTitle =
                                await translationService.translateToKorean(
                                    recipeDetail.title
                                );
                            if (recipeDetail.description) {
                                recipeDetail.translatedDescription =
                                    await translationService.translateToKorean(
                                        recipeDetail.description
                                    );
                            }

                            // 재료명 번역
                            if (
                                recipeDetail.ingredients &&
                                recipeDetail.ingredients.length > 0
                            ) {
                                console.log(`🌐 재료명 번역 중...`);
                                const ingredientNames =
                                    recipeDetail.ingredients.map(
                                        (ing) => ing.name
                                    );
                                const translatedNames =
                                    await translationService.translateList(
                                        ingredientNames
                                    );
                                recipeDetail.translatedIngredients =
                                    recipeDetail.ingredients.map(
                                        (ing, idx) => ({
                                            ...ing,
                                            translatedName:
                                                translatedNames[idx] ||
                                                ing.name,
                                        })
                                    );
                            }

                            // 조리 단계 번역
                            if (
                                recipeDetail.steps &&
                                recipeDetail.steps.length > 0
                            ) {
                                console.log(`🌐 조리 단계 번역 중...`);
                                recipeDetail.translatedSteps =
                                    await translationService.translateList(
                                        recipeDetail.steps
                                    );
                            }

                            recipes.push(recipeDetail);
                            console.log(
                                `✅ 레시피 추가됨: ${recipeDetail.translatedTitle}`
                            );
                        } else {
                            // 기본 정보만으로 레시피 추가 (번역 포함)
                            const title = item.title || "레시피";
                            const translatedTitle =
                                await translationService.translateToKorean(
                                    title
                                );
                            recipes.push({
                                id: item.id.toString(),
                                title: title,
                                translatedTitle: translatedTitle,
                                description: "",
                                translatedDescription: "",
                                imageUrl: item.image,
                            });
                            console.log(
                                `✅ 기본 정보로 레시피 추가: ${translatedTitle}`
                            );
                        }
                    } catch (error) {
                        console.log(
                            `❌ 레시피 ${item.id} 상세 정보 가져오기 실패:`,
                            error.message
                        );
                        // 기본 정보만으로 레시피 추가 (번역 포함)
                        try {
                            const title = item.title || "레시피";
                            const translatedTitle =
                                await translationService.translateToKorean(
                                    title
                                );
                            recipes.push({
                                id: item.id.toString(),
                                title: title,
                                translatedTitle: translatedTitle,
                                description: "",
                                translatedDescription: "",
                                imageUrl: item.image,
                            });
                        } catch (transError) {
                            // 번역 실패 시 원문으로 추가
                            recipes.push({
                                id: item.id.toString(),
                                title: item.title || "레시피",
                                translatedTitle: item.title || "레시피",
                                description: "",
                                translatedDescription: "",
                                imageUrl: item.image,
                            });
                        }
                    }
                }

                console.log(`🎉 총 ${recipes.length}개의 레시피를 반환합니다.`);
                return recipes;
            } else {
                throw new Error(
                    `레시피 검색에 실패했습니다. (상태 코드: ${response.status})`
                );
            }
        } catch (error) {
            console.log("❌ API 호출 에러:", error);
            console.log("❌ 에러 상세:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
            });

            // API 응답이 있는 경우 더 자세한 에러 메시지
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 401) {
                    throw new Error("API 키가 유효하지 않습니다.");
                } else if (status === 402) {
                    throw new Error("API 사용량 한도를 초과했습니다.");
                } else if (status === 429) {
                    throw new Error(
                        "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
                    );
                } else {
                    throw new Error(
                        errorData?.message ||
                            `API 오류가 발생했습니다. (상태 코드: ${status})`
                    );
                }
            }

            throw new Error(error.message || "네트워크 오류가 발생했습니다.");
        }
    }

    // 한식 레시피 검색 (식품안전나라 API)
    async searchKoreanRecipesByIngredients(ingredientNames) {
        try {
            console.log("🔍 한식 레시피 검색 - 재료:", ingredientNames);

            // API 호출 (재료 정보로 검색)
            // URL 형식: http://openapi.foodsafetykorea.go.kr/api/{인증키}/COOKRCP01/json/{시작위치}/{종료위치}
            const url = `${this.koreanRecipeBaseUrl}/${this.koreanRecipeApiKey}/COOKRCP01/json/1/100`;

            console.log("📡 한식 API 호출 URL:", url);

            const response = await axios.get(url, {
                timeout: 10000, // 10초 타임아웃
                headers: {
                    Accept: "application/json",
                },
            });

            console.log("✅ 한식 API 응답 상태:", response.status);
            console.log("📦 한식 API 응답 데이터 타입:", typeof response.data);
            console.log(
                "📦 한식 API 응답 데이터:",
                JSON.stringify(response.data).substring(0, 500)
            );

            if (response.status === 200) {
                const data = response.data;

                // API 응답 구조 확인
                if (!data || !data.COOKRCP01) {
                    console.log("⚠️ API 응답 구조 오류:", data);
                    throw new Error("API 응답 형식이 올바르지 않습니다.");
                }

                // 에러 메시지 확인
                if (
                    data.COOKRCP01.RESULT &&
                    data.COOKRCP01.RESULT.CODE !== "INFO-000"
                ) {
                    const errorMsg =
                        data.COOKRCP01.RESULT.MSG || "알 수 없는 오류";
                    console.log("❌ API 에러 메시지:", errorMsg);
                    throw new Error(errorMsg);
                }

                if (!data.COOKRCP01.row) {
                    console.log("⚠️ 한식 레시피 검색 결과가 없습니다.");
                    throw new Error(
                        "검색 결과가 없습니다. 다른 재료를 시도해보세요."
                    );
                }

                const recipes = data.COOKRCP01.row;

                if (!Array.isArray(recipes) || recipes.length === 0) {
                    console.log("⚠️ 한식 레시피 검색 결과가 없습니다.");
                    throw new Error(
                        "검색 결과가 없습니다. 다른 재료를 시도해보세요."
                    );
                }

                console.log(
                    `✅ ${recipes.length}개의 한식 레시피를 찾았습니다.`
                );

                // 재료명으로 필터링 (선택한 재료가 포함된 레시피만)
                const filteredRecipes = recipes.filter((recipe) => {
                    const recipeIngredients = recipe.RCP_PARTS_DTLS || "";
                    return ingredientNames.some((ingredient) =>
                        recipeIngredients.includes(ingredient)
                    );
                });

                // 필터링된 결과가 없으면 전체 결과 반환
                const finalRecipes =
                    filteredRecipes.length > 0
                        ? filteredRecipes
                        : recipes.slice(0, 10);

                // 레시피 데이터 변환
                const convertedRecipes = finalRecipes.map((recipe) => {
                    // 조리 단계 추출
                    const steps = [];
                    for (let i = 1; i <= 20; i++) {
                        const manualKey = `MANUAL${String(i).padStart(2, "0")}`;
                        const manualImgKey = `MANUAL_IMG${String(i).padStart(
                            2,
                            "0"
                        )}`;
                        if (recipe[manualKey] && recipe[manualKey].trim()) {
                            steps.push(recipe[manualKey]);
                        }
                    }

                    // 재료 정보 파싱
                    const ingredients = [];
                    if (recipe.RCP_PARTS_DTLS) {
                        const parts = recipe.RCP_PARTS_DTLS.split(",");
                        parts.forEach((part) => {
                            const trimmed = part.trim();
                            if (trimmed) {
                                ingredients.push({
                                    name: trimmed,
                                    amount: "",
                                    unit: "",
                                });
                            }
                        });
                    }

                    return {
                        id: recipe.RCP_SEQ || "",
                        title: recipe.RCP_NM || "레시피",
                        translatedTitle: recipe.RCP_NM || "레시피", // 한식은 이미 한글이므로 번역 불필요
                        description: recipe.HASH_TAG || "",
                        translatedDescription: recipe.HASH_TAG || "",
                        imageUrl:
                            recipe.ATT_FILE_NO_MK ||
                            recipe.ATT_FILE_NO_MAIN ||
                            "",
                        cookingTime: 0, // 한식 API에는 조리 시간 정보가 없음
                        servingSize: 1,
                        ingredients: ingredients,
                        translatedIngredients: ingredients, // 한식은 이미 한글이므로 번역 불필요
                        steps: steps,
                        translatedSteps: steps, // 한식은 이미 한글이므로 번역 불필요
                        // 추가 정보
                        recipeType: recipe.RCP_PAT2 || "", // 요리종류
                        recipeMethod: recipe.RCP_WAY2 || "", // 조리방법
                        calories: recipe.INFO_ENG || 0, // 열량
                        weight: recipe.INFO_WGT || "", // 중량
                    };
                });

                console.log(
                    `🎉 총 ${convertedRecipes.length}개의 한식 레시피를 반환합니다.`
                );
                return convertedRecipes;
            } else {
                throw new Error(
                    `한식 레시피 검색에 실패했습니다. (상태 코드: ${response.status})`
                );
            }
        } catch (error) {
            console.log("❌ 한식 API 호출 에러:", error);
            console.log("❌ 에러 상세:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
            });

            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 503) {
                    throw new Error(
                        "서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."
                    );
                } else if (status === 401 || status === 403) {
                    throw new Error("한식 API 인증키가 유효하지 않습니다.");
                } else if (status === 429) {
                    throw new Error(
                        "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
                    );
                } else {
                    // HTML 응답인 경우 (에러 페이지)
                    if (
                        typeof errorData === "string" &&
                        errorData.includes("<html>")
                    ) {
                        throw new Error(
                            `서버 오류가 발생했습니다. (상태 코드: ${status})`
                        );
                    }
                    throw new Error(
                        errorData?.message ||
                            `한식 API 오류가 발생했습니다. (상태 코드: ${status})`
                    );
                }
            } else if (error.code === "ECONNABORTED") {
                throw new Error(
                    "요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요."
                );
            } else if (
                error.message === "Network Error" ||
                error.code === "ERR_NETWORK"
            ) {
                throw new Error(
                    "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요."
                );
            }

            throw new Error(error.message || "네트워크 오류가 발생했습니다.");
        }
    }

    // 레시피 상세 정보 가져오기
    async getRecipeDetail(recipeId) {
        try {
            const url = `${this.baseUrl}/recipes/${recipeId}/information?apiKey=${this.apiKey}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                const data = response.data;
                return {
                    id: data.id?.toString() || "",
                    title: data.title || "레시피",
                    description: data.summary
                        ? data.summary.replace(/<[^>]*>/g, "").substring(0, 200)
                        : "",
                    imageUrl: data.image,
                    cookingTime: data.readyInMinutes || 0,
                    servingSize: data.servings || 1,
                    ingredients:
                        data.extendedIngredients?.map((ing) => ({
                            name: ing.name || ing.nameClean || "",
                            amount: ing.amount,
                            unit: ing.unit,
                        })) || [],
                    steps:
                        data.analyzedInstructions?.[0]?.steps?.map(
                            (step) => step.step
                        ) || [],
                };
            }
            return null;
        } catch (error) {
            console.log("레시피 상세 정보 가져오기 실패:", error);
            return null;
        }
    }
}

export default ApiService;
