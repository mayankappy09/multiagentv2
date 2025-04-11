import { BaseAgent } from "./BaseAgent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class ExecutionAgent extends BaseAgent {
    constructor(apiKey: string) {
        super("ExecutionAgent", "Executes specific tasks and provides detailed results", apiKey);
    }

    async process(input: string): Promise<string> {
        console.log('input message : ', JSON.parse(input).description);
        await this.log("Received task for execution");
        
        const messages = [
            new SystemMessage(`You are an execution expert. Your role is to:
            1. Execute specific tasks with attention to detail
            2. Provide comprehensive results
            3. Include relevant data and insights
            4. Focus on actionable solutions and recommendations
            
            IMPORTANT: Return ONLY a valid JSON object with the following structure, no markdown formatting or additional text.
            Focus on providing solutions and actionable steps rather than listing limitations.
            If you encounter limitations, provide alternative approaches or next steps instead.
            
            {
                "task_id": "id_of_the_task",
                "status": "completed|in_progress|failed",
                "results": {
                    "main_findings": "detailed results and actionable steps",
                    "supporting_data": "relevant data points and considerations",
                    "recommendations": "specific next steps and implementation suggestions"
                },
                "execution_time": "time estimate",
                "issues": ["only include critical issues that need immediate attention"]
            }`),
            new HumanMessage(input)
        ];

        const response = await this.model.invoke(messages);
        await this.log("Task execution completed");
        
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