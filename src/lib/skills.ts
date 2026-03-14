import { Skill } from './types';

export const skillsData: Skill[] = [
  {
    id: 'ai',
    name: 'AI',
    description: 'Artificial Intelligence fundamentals',
    difficulty: 5,
    category: 'root',
    parentId: null,
    resources: ['AI Crash Course', 'Stanford CS229'],
    children: [
      {
        id: 'ml',
        name: 'Machine Learning',
        description: 'Machine Learning fundamentals',
        difficulty: 4,
        category: 'foundation',
        parentId: 'ai',
        resources: ['Andrew Ng ML Course', 'Hands-On ML'],
        children: [
          {
            id: 'linear-regression',
            name: 'Linear Regression',
            description: 'Basic regression techniques',
            difficulty: 2,
            category: 'ml',
            parentId: 'ml',
            resources: ['Stanford CS229'],
          },
          {
            id: 'svm',
            name: 'SVM',
            description: 'Support Vector Machines',
            difficulty: 3,
            category: 'ml',
            parentId: 'ml',
            resources: ['Pattern Recognition Bishop'],
          },
          {
            id: 'decision-tree',
            name: 'Decision Tree',
            description: 'Tree-based models',
            difficulty: 2,
            category: 'ml',
            parentId: 'ml',
            resources: ['Hands-On ML'],
          },
        ],
      },
      {
        id: 'deep-learning',
        name: 'Deep Learning',
        description: 'Neural networks and deep learning',
        difficulty: 4,
        category: 'foundation',
        parentId: 'ai',
        resources: ['Deep Learning Book', 'Fast.ai'],
        children: [
          {
            id: 'cnn',
            name: 'CNN',
            description: 'Convolutional Neural Networks',
            difficulty: 4,
            category: 'dl',
            parentId: 'deep-learning',
            resources: ['CS231n'],
          },
          {
            id: 'rnn',
            name: 'RNN/LSTM',
            description: 'Recurrent Neural Networks',
            difficulty: 4,
            category: 'dl',
            parentId: 'deep-learning',
            resources: ['CS231n'],
          },
          {
            id: 'transformer',
            name: 'Transformer',
            description: 'Transformer architecture',
            difficulty: 5,
            category: 'dl',
            parentId: 'deep-learning',
            resources: ['Attention Is All You Need'],
          },
        ],
      },
      {
        id: 'llm',
        name: 'LLM',
        description: 'Large Language Models',
        difficulty: 4,
        category: 'application',
        parentId: 'ai',
        resources: ['LLM Course', 'Hugging Face Docs'],
        children: [
          {
            id: 'prompt-engineering',
            name: 'Prompt Engineering',
            description: 'LLM prompting techniques',
            difficulty: 2,
            category: 'llm',
            parentId: 'llm',
            resources: ['Prompt Engineering Guide'],
          },
          {
            id: 'rag',
            name: 'RAG',
            description: 'Retrieval Augmented Generation',
            difficulty: 4,
            category: 'llm',
            parentId: 'llm',
            resources: ['LangChain Docs', 'RAG Survey'],
          },
          {
            id: 'agent',
            name: 'Agent',
            description: 'AI Agents and autonomous systems',
            difficulty: 5,
            category: 'llm',
            parentId: 'llm',
            resources: ['Agent Course', 'LangChain Agents'],
          },
          {
            id: 'fine-tuning',
            name: 'Fine-tuning',
            description: 'Fine-tuning LLMs',
            difficulty: 5,
            category: 'llm',
            parentId: 'llm',
            resources: ['PEFT Docs', 'LoRA Paper'],
          },
        ],
      },
      {
        id: 'ai-infra',
        name: 'AI Infra',
        description: 'AI Infrastructure',
        difficulty: 4,
        category: 'infrastructure',
        parentId: 'ai',
        resources: ['MLOps Book'],
        children: [
          {
            id: 'vllm',
            name: 'vLLM',
            description: 'High-performance LLM inference',
            difficulty: 5,
            category: 'infra',
            parentId: 'ai-infra',
            resources: ['vLLM Docs'],
          },
          {
            id: 'langfuse',
            name: 'Langfuse',
            description: 'LLM observability platform',
            difficulty: 3,
            category: 'infra',
            parentId: 'ai-infra',
            resources: ['Langfuse Docs'],
          },
          {
            id: 'llamaindex',
            name: 'LlamaIndex',
            description: 'Data framework for LLMs',
            difficulty: 3,
            category: 'infra',
            parentId: 'ai-infra',
            resources: ['LlamaIndex Docs'],
          },
        ],
      },
    ],
  },
];

export function flattenSkills(skills: Skill[]): Skill[] {
  const result: Skill[] = [];
  function traverse(skill: Skill) {
    result.push(skill);
    skill.children?.forEach(traverse);
  }
  skills.forEach(traverse);
  return result;
}
