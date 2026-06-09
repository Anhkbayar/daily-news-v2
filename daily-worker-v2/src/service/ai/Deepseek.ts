import OpenAI from 'openai';

export function getDeepseek(env: { DEEPSEEK_API_KEY: string }) {
    return new OpenAI({
        apiKey: env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com"
    });
}