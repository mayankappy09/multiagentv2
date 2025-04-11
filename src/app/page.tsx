'use client';

import { useState, useEffect } from 'react';
import { TaskHistoryManager, TaskHistory } from '@/lib/utils/history';

interface AgentLog {
    type: string;
    message?: any;
    plan?: any;
    subtask?: any;
    result?: any;
}

interface TaskResult {
    status: any;
    results: {
        main_findings: any;
        supporting_data: any;
        recommendations: any;
    };
}

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [task, setTask] = useState('');
    const [results, setResults] = useState<TaskResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
    const [currentSubtask, setCurrentSubtask] = useState<any>(null);
    const [history, setHistory] = useState<TaskHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isApiKeySet, setIsApiKeySet] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load history on mount
        setHistory(TaskHistoryManager.getHistory());
        // Load API key from localStorage on component mount
        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
            setIsApiKeySet(true);
        }
    }, []);

    const handleApiKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            localStorage.setItem('openai_api_key', apiKey);
            setIsApiKeySet(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isApiKeySet) {
            setError('Please set your OpenAI API key first');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);
        setAgentLogs([]);
        setCurrentSubtask(null);

        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task, apiKey }),
            });

            if (!response.ok) {
                throw new Error('Failed to process task');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response stream');
            }

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        
                        switch (data.type) {
                            case 'connection':
                                setAgentLogs(prev => [...prev, { type: 'connection', message: data.message }]);
                                break;
                            case 'planning_start':
                                setAgentLogs(prev => [...prev, { type: 'planning_start', message: data.message }]);
                                break;
                            case 'planning_complete':
                                setAgentLogs(prev => [...prev, { type: 'planning_complete', plan: data.plan }]);
                                break;
                            case 'execution_start':
                                setCurrentSubtask(data.subtask);
                                setAgentLogs(prev => [...prev, { type: 'execution_start', subtask: data.subtask }]);
                                break;
                            case 'execution_complete':
                                setResults(prev => [...prev, data.result]);
                                setAgentLogs(prev => [...prev, { type: 'execution_complete', result: data.result }]);
                                setCurrentSubtask(null);
                                break;
                            case 'error':
                                setError(data.error);
                                break;
                            case 'final':
                                setAgentLogs(prev => [...prev, { type: 'final', result: data.result }]);
                                // Save to history
                                TaskHistoryManager.saveTask(task, results, 'completed');
                                setHistory(TaskHistoryManager.getHistory());
                                break;
                        }
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            // Save failed task to history
            TaskHistoryManager.saveTask(task, [], 'failed');
            setHistory(TaskHistoryManager.getHistory());
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryItemClick = (historyItem: TaskHistory) => {
        setTask(historyItem.task);
        setResults(historyItem.results);
    };

    const handleClearHistory = () => {
        TaskHistoryManager.clearHistory();
        setHistory([]);
    };

    const renderObjectAsList = (obj: any) => {
        if (typeof obj === 'string') return <p className="text-gray-600">{obj}</p>;
        
        if (Array.isArray(obj)) {
            return (
                <ul className="list-disc pl-5 space-y-1">
                    {obj.map((item, index) => (
                        <li key={index} className="text-gray-600">
                            {typeof item === 'string' ? item : renderObjectAsList(item)}
                        </li>
                    ))}
                </ul>
            );
        }

        if (typeof obj === 'object' && obj !== null) {
            return (
                <div className="space-y-2">
                    {Object.entries(obj).map(([key, value]) => (
                        <div key={key} className="border-l-2 border-blue-200 pl-4">
                            <h5 className="text-sm font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, ' ')}:
                            </h5>
                            <div className="ml-2 mt-1">
                                {typeof value === 'object' ? (
                                    renderObjectAsList(value)
                                ) : (
                                    <p className="text-gray-600">{String(value)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return <p className="text-gray-600">{String(obj)}</p>;
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-sky-800 to-green-700" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1)_0%,transparent_50%)] animate-pulse" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZD0iTTUwIDJjLTI2LjUgMC00OCAyMS41LTQ4IDQ4czIxLjUgNDggNDggNDggNDgtMjEuNSA0OC00OC0yMS41LTQ4LTQ4LTQ4em0wIDkwYy0yMy4yIDAtNDIgMTguOC00Mi00MnMxOC44LTQyIDQyLTQyIDQyIDE4LjggNDIgNDItMTguOCA0Mi00MiA0MnoiIGZpbGw9IiMxYzFjMWMiLz48cGF0aCBkPSJNNTAgMTBjLTIyLjEgMC00MCAxNy45LTQwIDQwczE3LjkgNDAgNDAgNDAgNDAtMTcuOSA0MC00MC0xNy45LTQwLTQwLTQwem0wIDc0Yy0xOC43IDAtMzQtMTUuMy0zNC0zNHMxNS4zLTM0IDM0LTM0IDM0IDE1LjMgMzQgMzQtMTUuMyAzNC0zNCAzNHoiIGZpbGw9IiMyYzJjMmMiLz48cGF0aCBkPSJNNTAgMThjLTE3LjcgMC0zMiAxNC4zLTMyIDMyczE0LjMgMzIgMzIgMzIgMzItMTQuMyAzMi0zMi0xNC4zLTMyLTMyLTMyem0wIDU4Yy0xNC40IDAtMjYtMTEuNi0yNi0yNnMxMS42LTI2IDI2LTI2IDI2IDExLjYgMjYgMjYtMTEuNiAyNi0yNiAyNnoiIGZpbGw9IiMzYzNjM2MiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] bg-repeat opacity-5" />
            
            {/* Animated AI Icon */}
            <div className="fixed top-4 right-4 z-50">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-green-500/20 to-gold-500/20 rounded-full animate-ping" />
                    <div className="relative flex items-center justify-center w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full border border-sky-500/30">
                        <svg
                            className="w-6 h-6 text-gold-400 animate-pulse"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="currentColor"
                                className="opacity-20"
                                transform="scale(0.8) translate(3,3)"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Multi-Agent Task Processing
                    </h1>
                    <p className="text-lg text-sky-300">
                        Enter your task and let our AI agents handle it for you
                    </p>
                </div>

                {!isApiKeySet ? (
                    <div className="max-w-md mx-auto bg-black/50 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8 border border-sky-500/20 transition-all duration-300 hover:border-gold-500/50">
                        <h2 className="text-xl font-semibold text-sky-400 mb-4">
                            Set OpenAI API Key
                        </h2>
                        <form onSubmit={handleApiKeySubmit} className="space-y-4">
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-sky-300">
                                    OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="mt-1 block w-full rounded-md bg-black/50 border border-sky-500/30 text-gray-200 shadow-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-300"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-green-600 hover:from-sky-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all duration-300"
                            >
                                Save API Key
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex gap-8">
                        {/* History Sidebar */}
                        <div className={`fixed left-0 top-0 h-full w-64 bg-black/50 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ease-in-out ${
                            showHistory ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-sky-400">Task History</h2>
                                    <button
                                        onClick={handleClearHistory}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors duration-300"
                                    >
                                        Clear History
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
                                    {history.map((item, index) => (
                                        <div
                                            key={index}
                                            className="p-3 border border-sky-500/20 rounded-lg cursor-pointer hover:border-gold-500/50 hover:bg-sky-500/10 transition-all duration-300"
                                            onClick={() => handleHistoryItemClick(item)}
                                        >
                                            <p className="text-sm font-medium truncate text-gray-200">{item.task}</p>
                                            <p className="text-xs text-sky-400">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className={`flex-1 transition-all duration-300 ${showHistory ? 'ml-64' : 'ml-0'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:border-gold-500/50 transition-all duration-300"
                                >
                                    {showHistory ? 'Hide History' : 'Show History'}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="mb-8">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => setTask(e.target.value)}
                                        placeholder="Enter your task..."
                                        className="flex-1 p-4 bg-black/50 backdrop-blur-sm border border-sky-500/30 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-gray-200 transition-all duration-300"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-4 bg-gradient-to-r from-sky-600 to-green-600 hover:from-sky-700 hover:to-green-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-sky-500/20 border-t-gold-500 rounded-full animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            'Process Task'
                                        )}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Agent Logs */}
                                <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-sky-500/20">
                                    <h2 className="text-xl font-semibold text-sky-400 mb-4">Agent Processing Logs</h2>
                                    <div className="space-y-4">
                                        {agentLogs.map((log, index) => (
                                            <div key={index} className="p-4 bg-sky-500/5 rounded-lg border border-sky-500/20 transition-all duration-300 hover:border-gold-500/50">
                                                {log.type === 'connection' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-400">🔌</span>
                                                        <p className="text-gray-300">{log.message}</p>
                                                    </div>
                                                )}
                                                {log.type === 'planning_start' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sky-400">📋</span>
                                                        <div>
                                                            <p className="font-medium text-sky-400">Task Planner Agent</p>
                                                            <p className="text-gray-300">{log.message}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.type === 'planning_complete' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-400">✅</span>
                                                        <div>
                                                            <p className="font-medium text-green-400">Task Planner Agent</p>
                                                            <p className="text-gray-300">Planning Complete</p>
                                                            <p className="text-sm text-sky-400 mt-1">
                                                                Created {log.plan?.subtasks?.length || 0} subtasks
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.type === 'execution_start' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sky-400">▶️</span>
                                                        <div>
                                                            <p className="font-medium text-sky-400">Execution Agent</p>
                                                            <p className="text-gray-300">Processing: {log.subtask}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.type === 'execution_complete' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-400">✅</span>
                                                        <div>
                                                            <p className="font-medium text-green-400">Execution Agent</p>
                                                            <p className="text-gray-300">Task Completed</p>
                                                            <p className="text-sm text-sky-400 mt-1">
                                                                Status: {log.result?.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {currentSubtask && (
                                            <div className="p-4 bg-sky-500/5 rounded-lg border border-sky-500/20">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sky-400">⏳</span>
                                                    <div>
                                                        <p className="font-medium text-sky-400">Execution Agent</p>
                                                        <p className="text-gray-300">Currently Processing: {currentSubtask}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-sky-500/20">
                                    <h2 className="text-xl font-semibold text-sky-400 mb-4">Task Results</h2>
                                    <div className="space-y-6">
                                        {results.map((result, index) => (
                                            <div key={index} className="p-4 bg-sky-500/5 rounded-lg border border-sky-500/20 transition-all duration-300 hover:border-gold-500/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-medium text-gray-200">Task {index + 1}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        result.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-sky-500/20 text-sky-400'
                                                    }`}>
                                                        {result.status}
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-sky-300 mb-2">Main Findings</h4>
                                                        <div className="bg-black/50 p-3 rounded border border-sky-500/20">
                                                            {renderObjectAsList(result.results.main_findings)}
                                                        </div>
                                                    </div>

                                                    {result.results.supporting_data && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-sky-300 mb-2">Supporting Data</h4>
                                                            <div className="bg-black/50 p-3 rounded border border-sky-500/20">
                                                                {renderObjectAsList(result.results.supporting_data)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {result.results.recommendations && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-sky-300 mb-2">Recommendations</h4>
                                                            <div className="bg-black/50 p-3 rounded border border-sky-500/20">
                                                                {renderObjectAsList(result.results.recommendations)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
