export interface TaskHistory {
    task: string;
    results: any[];
    status: 'completed' | 'failed';
    timestamp: Date;
}

interface TaskResult {
    status: string;
    results: {
        main_findings: string | object;
        supporting_data: string | object;
        recommendations: string | object;
    };
}

export class TaskHistoryManager {
    private static readonly STORAGE_KEY = 'task_history';

    static saveTask(task: string, results: any[], status: 'completed' | 'failed'): void {
        const history = this.getHistory();
        history.unshift({
            task,
            results,
            status,
            timestamp: new Date()
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    }

    static getHistory(): TaskHistory[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        return parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
        }));
    }

    static clearHistory(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
} 