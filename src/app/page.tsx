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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Multi-Agent Task Processing
                    </h1>
                    <p className="text-lg text-gray-600">
                        Enter your task and let our AI agents handle it for you
                    </p>
                </div>

                {!isApiKeySet ? (
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Set OpenAI API Key
                        </h2>
                        <form onSubmit={handleApiKeySubmit} className="space-y-4">
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                                    OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Save API Key
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex gap-8">
                        {/* History Sidebar */}
                        <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                            showHistory ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Task History</h2>
                                    <button
                                        onClick={handleClearHistory}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Clear History
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
                                    {history.map((item, index) => (
                                        <div
                                            key={index}
                                            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleHistoryItemClick(item)}
                                        >
                                            <p className="text-sm font-medium truncate">{item.task}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
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
                                        className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Process Task'}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Agent Logs */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4">Agent Processing Logs</h2>
                                    <div className="space-y-4">
                                        {agentLogs.map((log, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                {log.type === 'connection' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-600">🔌</span>
                                                        <p className="text-gray-600">{log.message}</p>
                                                    </div>
                                                )}
                                                {log.type === 'planning_start' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-600">📋</span>
                                                        <div>
                                                            <p className="font-medium text-blue-600">Task Planner Agent</p>
                                                            <p className="text-gray-600">{log.message}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.type === 'planning_complete' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600">✅</span>
                                                        <div>
                                                            <p className="font-medium text-green-600">Task Planner Agent</p>
                                                            <p className="text-gray-600">Planning Complete</p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Created {log.plan?.subtasks?.length || 0} subtasks
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.type === 'execution_start' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-purple-600">▶️</span>
                                                        <div>
                                                            <p className="font-medium text-purple-600">Execution Agent</p>
                                                            <p className="text-gray-600">Processing: {log.subtask}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.type === 'execution_complete' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600">✅</span>
                                                        <div>
                                                            <p className="font-medium text-green-600">Execution Agent</p>
                                                            <p className="text-gray-600">Task Completed</p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Status: {log.result?.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {currentSubtask && (
                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-purple-600">⏳</span>
                                                    <div>
                                                        <p className="font-medium text-purple-600">Execution Agent</p>
                                                        <p className="text-gray-600">Currently Processing: {currentSubtask}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-semibold mb-4">Task Results</h2>
                                    <div className="space-y-6">
                                        {results.map((result, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-medium text-gray-900">Task {index + 1}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        result.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        result.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {result.status}
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Main Findings</h4>
                                                        <div className="bg-white p-3 rounded border border-gray-100">
                                                            {renderObjectAsList(result.results.main_findings)}
                                                        </div>
                                                    </div>

                                                    {result.results.supporting_data && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Supporting Data</h4>
                                                            <div className="bg-white p-3 rounded border border-gray-100">
                                                                {renderObjectAsList(result.results.supporting_data)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {result.results.recommendations && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                                                            <div className="bg-white p-3 rounded border border-gray-100">
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
