# Technical Specification: OpenAI Chat Side Panel for Task Planner

## Overview
We'll implement a side panel that slides in from the right when the user starts the task planner. This panel will contain a chat interface where users can get help organizing their work.

## Component Structure
1. Create a new `ChatPanel` component for the side panel
2. Create a `ChatMessage` component to render individual messages
3. Create a `ChatInput` component for user input
4. Update the planner page to use these components

## Detailed Specifications

### 1. ChatPanel Component
Location: `/src/components/ChatPanel.tsx`
Purpose: Slide-in panel that contains the entire chat interface

Key features:
- Uses the existing Sheet component from shadcn/ui
- Maintains chat history state
- Initiates the chat with a welcome message
- Handles sending messages to OpenAI API
- Processes streaming responses

### 2. ChatMessage Component
Location: `/src/components/ChatMessage.tsx`
Purpose: Renders individual chat messages with appropriate styling

Key features:
- Different styling for user and AI messages
- Support for loading/typing indicator
- Markdown rendering for AI responses (optional)

### 3. ChatInput Component
Location: `/src/components/ChatInput.tsx`
Purpose: Input field for user to type and send messages

Key features:
- Text input with send button
- Disable input while waiting for AI response
- Handle Enter key to send message

### 4. Update Planner Page
Location: `/src/app/planner/page.tsx`
Purpose: Add the chat panel and connect it to the task planner button

Key changes:
- Import the ChatPanel component
- Add state to control panel visibility
- Connect the button's onClick to toggle panel

## State Management
The following state will be needed:
- `open`: boolean to control panel visibility
- `messages`: array of message objects with `role` and `content`
- `loading`: boolean to track when AI is generating a response
- `input`: string for the current user input

## API Integration
We'll use the existing OpenAI integration:
- Use the `streamTextGenerationWithState` function from `streamClient.ts`
- Build conversation history to provide context
- Use a system prompt that sets the context for helping the user plan tasks

## UI/UX Considerations
- Add a smooth animation for the panel sliding in/out
- Include a typing indicator while waiting for AI responses
- Style messages to differentiate between user and AI
- Enable scrolling for longer conversations
- Add a header with a title and close button

## Implementation Checklist:

### 1. Create the ChatMessage Component
1. Create a new file at `/src/components/ChatMessage.tsx`
2. Implement the ChatMessage component with different styles for user and AI messages
3. Add a typing indicator animation for when AI is generating a response

### 2. Create the ChatInput Component
1. Create a new file at `/src/components/ChatInput.tsx`
2. Implement the input field with a send button
3. Add handling for the Enter key to send messages
4. Implement disabled state for when AI is responding

### 3. Create the ChatPanel Component
1. Create a new file at `/src/components/ChatPanel.tsx`
2. Import and use the Sheet component from the UI library
3. Import the ChatMessage and ChatInput components
4. Implement state for messages, loading, and input
5. Create the function to send messages to OpenAI
6. Implement the welcome message when the panel first opens
7. Add scrolling container for the message history
8. Add a header with title and close button

### 4. Update the Planner Page
1. Import the ChatPanel component in `/src/app/planner/page.tsx`
2. Add state to control the panel's visibility
3. Update the planner button to toggle the panel
4. Add the ChatPanel component to the JSX
5. Pass the necessary props to control the panel

### 5. Test the Implementation
1. Verify that the planner button opens the side panel
2. Confirm that the welcome message appears when the panel opens
3. Test sending messages and receiving responses
4. Verify that the streaming responses work correctly
5. Test closing the panel and reopening it

IMPLEMENTATION CHECKLIST:
1. Create file `/src/components/ChatMessage.tsx` with styling for user and AI messages
2. Add typing indicator animation in ChatMessage component
3. Create file `/src/components/ChatInput.tsx` with input field and send button
4. Implement Enter key handling in ChatInput component
5. Add disabled state for input when AI is responding
6. Create file `/src/components/ChatPanel.tsx` using Sheet component
7. Import ChatMessage and ChatInput components in ChatPanel
8. Implement state for messages, loading, and input in ChatPanel
9. Create function to send messages to OpenAI API in ChatPanel
10. Add welcome message when panel first opens
11. Add scrolling container for message history
12. Add header with title and close button to panel
13. Import ChatPanel component in `/src/app/planner/page.tsx`
14. Add state to control panel visibility in planner page
15. Update the planner button to toggle panel
16. Add ChatPanel component to planner page JSX
17. Test button opens side panel correctly
18. Verify welcome message appears when panel opens
19. Test sending messages and receiving responses
20. Verify streaming responses work correctly
21. Test closing and reopening the panel