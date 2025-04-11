# Multi-Agent Collaboration System

A sophisticated multi-agent system that leverages OpenAI's GPT models to collaboratively solve complex tasks through planning and execution phases.

## Features

- **Task Planning & Execution**: Breaks down complex tasks into manageable subtasks
- **Real-time Processing**: Streams task progress and results in real-time
- **History Management**: Maintains a history of all processed tasks
- **Error Handling**: Robust error handling and recovery mechanisms
- **API Key Management**: Secure handling of OpenAI API keys
- **Modern UI**: Clean, responsive interface with real-time updates

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4
- **State Management**: React Hooks
- **Data Storage**: Local Storage for task history
- **Streaming**: Server-Sent Events (SSE)

## Project Structure

```
multiAgent/
├── prod/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── process/
│   │   │   │       └── route.ts
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── lib/
│   │   │   ├── agents/
│   │   │   │   ├── BaseAgent.ts
│   │   │   │   ├── TaskPlannerAgent.ts
│   │   │   │   ├── ExecutionAgent.ts
│   │   │   │   └── AgentCoordinator.ts
│   │   │   └── utils/
│   │   │       └── history.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   │   └── icons/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── README.md
```

## Setup Instructions

1. **Prerequisites**
   - Node.js 18+ installed
   - OpenAI API key

2. **Installation**
   ```bash
   cd multiAgent/prod
   npm install
   ```

3. **Environment Setup**
   - No environment variables needed - API key is handled through the UI

4. **Starting the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Usage

1. **API Key Setup**
   - Enter your OpenAI API key in the input field at the top of the page
   - The key is used only for the current session and is not stored

2. **Task Processing**
   - Enter your task in the main input field
   - Click "Process Task" to start the multi-agent workflow
   - Monitor real-time progress in the Agent Processing Logs
   - View results in the Task Results section

3. **History Management**
   - Access past tasks in the History sidebar
   - Click on any history item to view its details
   - Clear history using the "Clear History" button

## Agent Architecture

The system uses a multi-agent approach with specialized agents:

1. **AgentCoordinator**
   - Orchestrates the entire task processing workflow
   - Manages communication between agents
   - Handles streaming updates and error recovery

2. **TaskPlannerAgent**
   - Analyzes the main task
   - Breaks it down into logical subtasks
   - Generates a structured execution plan

3. **ExecutionAgent**
   - Executes individual subtasks
   - Provides detailed results for each step
   - Handles error cases and recovery

## Error Handling

The system includes comprehensive error handling:

1. **API Key Validation**
   - Validates API key format
   - Provides clear error messages
   - Prevents invalid API calls

2. **Task Processing**
   - Graceful handling of API errors
   - Automatic retry mechanisms
   - Detailed error reporting

3. **Streaming**
   - Robust SSE connection management
   - Automatic reconnection
   - Clear status indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their powerful GPT models
- Next.js team for the excellent framework
- The open-source community for various tools and libraries
