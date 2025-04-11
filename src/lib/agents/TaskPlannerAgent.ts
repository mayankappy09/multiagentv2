import { BaseAgent } from "./BaseAgent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class TaskPlannerAgent extends BaseAgent {
    constructor(apiKey: string) {
        super("TaskPlanner", "Breaks down complex tasks into manageable subtasks", apiKey);
    }

    async process(input: string): Promise<string> {
        await this.log("Received task for planning");
        
        const messages = [
            new SystemMessage(`You are a task planning expert. Your role is to:
            1. Analyze complex tasks
            2. Break them down into clear, actionable subtasks
            3. Identify dependencies between subtasks
            4. Suggest optimal execution order
            
            IMPORTANT: Return ONLY a valid JSON object with the following structure, no markdown formatting or additional text:
            {
                "subtasks": [
                    {
                        "id": "unique_id",
                        "description": "clear description",
                        "dependencies": ["other_task_ids"],
                        "estimated_time": "time estimate"
                    }
                ],
                "execution_order": ["task_id1", "task_id2", ...]
            }`),
            new HumanMessage(input)
        ];

        const response = await this.model.invoke(messages);
        await this.log("Task planning completed");
        
        // Handle the response content
        let content = '';
        if (typeof response.content === 'string') {
            content = response.content;
        } else if (Array.isArray(response.content)) {
            content = response.content.map(item => 
                typeof item === 'string' ? item : JSON.stringify(item)
            ).join('');
        } else {
            content = JSON.stringify(response.content);
        }
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = content.replace(/```json\n?|\n?```/g, '').trim();
        return cleanResponse;
    }
} 