import { NextResponse } from 'next/server';
import { AgentCoordinator } from '@/lib/agents/AgentCoordinator';

export async function POST(request: Request) {
    try {
        const { task, apiKey } = await request.json();
        
        if (!task) {
            return NextResponse.json(
                { error: 'Task is required' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key is required' },
                { status: 400 }
            );
        }

        // Set up SSE headers
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const coordinator = new AgentCoordinator(apiKey);
                
                try {
                    // Send initial connection message
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to agent system' })}\n\n`));

                    // Process task and stream results
                    const result = await coordinator.processTask(task, (message) => {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
                    });

                    // Send final result
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'final', result })}\n\n`));
                } catch (error) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'An error occurred' })}\n\n`));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error processing task:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
} 