# Multi-Agent AI System Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [AI Implementation](#ai-implementation)
4. [Setup and Installation](#setup-and-installation)
5. [Usage Guide](#usage-guide)
6. [Development Guidelines](#development-guidelines)
7. [Troubleshooting](#troubleshooting)

## Architecture Overview

The Multi-Agent AI System is built using a modular architecture that separates concerns into distinct components:

- **Frontend**: Next.js application with TypeScript
- **Backend**: Node.js with Express
- **AI Components**: OpenAI API integration
- **Database**: Local storage for task history

### Key Features
- Real-time task processing
- Multi-agent collaboration
- Task history tracking
- Streaming updates
- Error handling and recovery

## System Components

### 1. Base Agent (`BaseAgent.ts`)
- Abstract base class for all agents
- Handles OpenAI API communication
- Provides common functionality for all agents
- Implements error handling and logging

### 2. Task Planner Agent (`TaskPlannerAgent.ts`)
- Breaks down complex tasks into subtasks
- Uses OpenAI to generate task plans
- Validates and formats task plans
- Handles task decomposition logic

### 3. Execution Agent (`ExecutionAgent.ts`)
- Executes individual subtasks
- Processes task results
- Handles task-specific logic
- Manages task state

### 4. Agent Coordinator (`AgentCoordinator.ts`)
- Orchestrates agent collaboration
- Manages task flow
- Handles error recovery
- Generates task summaries

### 5. Frontend Components
- Task input interface
- Real-time agent logs
- Task history sidebar
- Result display
- API key management

## AI Implementation

### OpenAI Integration
- Uses GPT-4 for task planning and execution
- Implements streaming for real-time updates
- Handles API key management
- Implements error handling and retries

### Prompt Engineering
- Structured prompts for task planning
- Context-aware execution prompts
- Error recovery prompts
- Summary generation prompts

### Response Processing
- JSON parsing and validation
- Error handling and recovery
- Result formatting
- Streaming updates

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Git

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd multiAgent/prod
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create `.env.local` file
   - Add your OpenAI API key

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage Guide

### Starting the Application
1. Enter your OpenAI API key in the interface
2. Submit tasks through the input field
3. Monitor agent logs in real-time
4. View task history in the sidebar
5. Access detailed results for completed tasks

### Task Processing Flow
1. User submits task
2. Task Planner breaks down task
3. Execution Agent processes subtasks
4. Results are streamed in real-time
5. Summary is generated and displayed

### Error Handling
- API key validation
- Task validation
- Error recovery
- User feedback

## Development Guidelines

### Code Structure
- Follow TypeScript best practices
- Use proper type definitions
- Implement error handling
- Add logging for debugging

### Adding New Features
1. Create new agent class if needed
2. Implement required interfaces
3. Add frontend components
4. Update type definitions
5. Test thoroughly

### Testing
- Test individual agents
- Test agent coordination
- Test error scenarios
- Test UI components

## Troubleshooting

### Common Issues
1. API Key Issues
   - Check API key validity
   - Verify environment variables
   - Check network connectivity

2. Task Processing Errors
   - Check task format
   - Verify agent responses
   - Check error logs

3. UI Issues
   - Clear browser cache
   - Check console errors
   - Verify component state

### Debugging Tips
- Use browser dev tools
- Check server logs
- Monitor network requests
- Review agent logs

## Best Practices

### Code Organization
- Keep components modular
- Use proper type definitions
- Implement error handling
- Add comprehensive logging

### Performance Optimization
- Use streaming for large tasks
- Implement caching where appropriate
- Optimize API calls
- Handle memory efficiently

### Security
- Secure API key handling
- Input validation
- Error message sanitization
- Secure data storage

## Future Improvements

### Planned Features
- Enhanced error recovery
- Advanced task planning
- Improved result formatting
- Additional agent types

### Technical Debt
- Type safety improvements
- Error handling enhancements
- Performance optimizations
- Code documentation

## Contributing

### Guidelines
- Follow coding standards
- Add proper documentation
- Include tests
- Update documentation

### Process
1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 