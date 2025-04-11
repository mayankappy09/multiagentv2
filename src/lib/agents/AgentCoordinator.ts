import { TaskPlannerAgent } from "./TaskPlannerAgent";
import { ExecutionAgent } from "./ExecutionAgent";

export class AgentCoordinator {
    private taskPlanner: TaskPlannerAgent;
    private executionAgent: ExecutionAgent;
    private executionHistory: Array<{
        taskId: string;
        status: string;
        result: string;
        timestamp: Date;
    }>;

    constructor(apiKey: string) {
        this.taskPlanner = new TaskPlannerAgent(apiKey);
        this.executionAgent = new ExecutionAgent(apiKey);
        this.executionHistory = [];
    }

    private parseJSONResponse(response: string): any {
        try {
            return JSON.parse(response);
        } catch (error) {
            console.error('Failed to parse JSON response:', response);
            throw new Error('Invalid JSON response from agent');
        }
    }

    async processTask(task: string, onMessage?: (message: any) => void): Promise<string> {
        try {
            // Plan the task
            if (onMessage) {
                onMessage({ type: 'planning_start', message: 'Starting task planning...' });
            }
            const plan = await this.taskPlanner.process(task);
            const parsedPlan = JSON.parse(plan);
            
            if (onMessage) {
                onMessage({ 
                    type: 'planning_complete', 
                    plan: parsedPlan 
                });
            }

            // Execute each subtask
            const results = [];
            for (const subtask of parsedPlan.subtasks) {
                if (onMessage) {
                    onMessage({ 
                        type: 'execution_start', 
                        subtask: subtask.task 
                    });
                }

                const result = await this.executionAgent.process(JSON.stringify(subtask));
                const parsedResult = JSON.parse(result);
                results.push(parsedResult);

                if (onMessage) {
                    onMessage({ 
                        type: 'execution_complete', 
                        result: parsedResult 
                    });
                }
            }

            // Combine results
            const finalResponse = {
                original_task: task,
                plan: parsedPlan,
                results: results,
                summary: this.generateSummary(results)
            };

            return JSON.stringify(finalResponse);
        } catch (error) {
            throw error;
        }
    }

    private generateSummary(results: any[]): string {
        return results.map((result, index) => 
            `Task ${index + 1}: ${result.status}\n${result.results.main_findings}`
        ).join('\n\n');
    }

    getExecutionHistory() {
        return this.executionHistory;
    }
} 