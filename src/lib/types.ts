export interface ProcessTaskResponse {
    results: TaskResult[];
    summary: {
        total_tasks: number;
        successful_tasks: number;
        success_rate: number;
    };
}

export interface TaskResult {
    status: 'success' | 'error';
    main_findings: string;
    supporting_data: Record<string, any>;
    recommendations: string[];
    results?: {
        main_findings: string;
        supporting_data: Record<string, any>;
        recommendations: string[];
    };
}

export interface TaskHistory {
    task: string;
    timestamp: string;
    results: TaskResult[];
    status: 'pending' | 'completed' | 'failed';
}

export interface AgentLog {
    message: string;
    subtask?: string;
    result?: any;
    type?: string;
    plan?: any;
} 