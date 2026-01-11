// 간단한 번역 서비스 (Google Translate API 사용)
class TranslationService {
    constructor() {
        // Google Translate API는 무료 버전이 제한적이므로
        // 여기서는 간단한 번역 라이브러리나 API를 사용할 수 있습니다.
        // 실제로는 @vitalets/google-translate-api 같은 라이브러리를 사용하거나
        // 다른 번역 서비스를 사용할 수 있습니다.
    }

    // 영어 → 한국어 번역 (간단한 구현)
    async translateToKorean(text) {
        try {
            // Google Translate API 사용 (무료 버전)
            // 실제 구현 시 번역 라이브러리 사용 권장
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(
                    text
                )}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    return data[0][0][0];
                }
            }

            // 번역 실패 시 원문 반환
            return text;
        } catch (error) {
            console.log("번역 실패:", error);
            return text; // 실패하면 원문 반환
        }
    }

    // 여러 문장 한번에 번역
    async translateList(texts) {
        const translated = [];
        for (const text of texts) {
            if (text && text.trim()) {
                translated.push(await this.translateToKorean(text));
            } else {
                translated.push(text);
            }
        }
        return translated;
    }
}

export default TranslationService;
