export const API_PATHS = {
    QUESTIONS: "/api/questions",
    RESULTS: "/api/results",
    CHAT: "/api/chat",
    USER_SETTINGS: "/api/user/settings",
    USER_PASSWORD: "/api/user/password",
    TESTS: "/api/tests",
    AUTH_REGISTER: "/api/auth/register",
    getQuestionsByTestId: (testId: string) => `/api/questions?testId=${testId}`,
    getQuestionExplanation: (questionId: string) => `/api/questions/${questionId}/explanation`,
    getChatByQuestionId: (questionId: string) => `/api/chat?questionId=${questionId}`,
};
