import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export abstract class BaseAgent {
    protected model: BaseChatModel;
    protected name: string;
    protected role: string;

    constructor(name: string, role: string, apiKey: string) {
        this.name = name;
        this.role = role;
        this.model = new ChatOpenAI({
            modelName: "gpt-4-turbo-preview",
            temperature: 0.7,
            openAIApiKey: apiKey
        });
    }

    abstract process(input: string): Promise<string>;

    protected async log(message: string): Promise<void> {
        console.log(`[${this.name}] ${message}`);
    }

    public getName(): string {
        return this.name;
    }

    public getRole(): string {
        return this.role;
    }
} 