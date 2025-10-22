import OpenAI from 'openai';

const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export interface AITask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
}

export const generateTasks = async (
  project: string,
  timeline?: string,
  complexity?: string
): Promise<AITask[]> => {
  const timelineContext = timeline ? `The project timeline is ${timeline}.` : '';
  const complexityContext = complexity ? `The complexity level is ${complexity}.` : '';
  
  const prompt = `Break down this project into 5-15 specific, actionable tasks. ${timelineContext} ${complexityContext}

Project: ${project}

Return a JSON array of tasks with this exact structure:
[
  {
    "title": "Task title",
    "description": "Detailed description of what needs to be done",
    "priority": "high|medium|low",
    "estimated_hours": number
  }
]

Make tasks specific, actionable, and appropriately prioritized. Focus on concrete deliverables.`;

  try {
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content received from OpenAI');

    const tasks = JSON.parse(content) as AITask[];
    return tasks;
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw new Error('Failed to generate tasks. Please try again.');
  }
};