// use this command to download dependancies: "npm install"



require('dotenv').config();
import express from 'express';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from 'langchain/prompts';
import { BufferMemory } from 'langchain/memory';

const app = express();
const port = 6000;

app.use(express.json());

// Create a global object to store the conversation history
let conversationHistory = {
  system: [],
  user: [],
};

app.post('/chat', async (req, res) => {
  const { input } = req.body;

  const chat = new ChatOpenAI({ temperature: 0.1 });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
    ),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{input}'),
  ]);

  const chain = new ConversationChain({
    memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
    prompt: chatPrompt,
    llm: chat,
  });

  // Append the input to the user message history
  conversationHistory.user.push(input);

  const response = await chain.call({
    input: conversationHistory.system.concat(conversationHistory.user),
  });

  // Append the system and user messages to the conversation history
  conversationHistory.system.push(response.response);
  conversationHistory.user.push(input);

  res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
