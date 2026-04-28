import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const FeedbackAnalysisSchema = z.object({
  detected_language: z.enum(['tamil', 'sinhala', 'english', 'tanglish', 'singlish', 'mixed_other', 'unknown']),
  script: z.enum(['tamil_native', 'sinhala_native', 'latin', 'mixed']),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  sentiment_confidence: z.number().min(0).max(1),
  themes: z.array(z.enum(['service', 'price', 'quality', 'delivery', 'staff', 'food', 'app_ux', 'billing', 'other'])),
  is_sarcastic: z.boolean(),
  contains_code_mix: z.boolean(),
  rationale: z.string(),
});

export type FeedbackAnalysis = z.infer<typeof FeedbackAnalysisSchema>;

const SYSTEM_PROMPT = `You are a multilingual feedback analyzer for Sri Lankan businesses.
Rules:
1. Do NOT translate the input. Classify holistically.
2. If the text mixes Tamil/Sinhala with English (in any script), set contains_code_mix = true.
3. If irony or sarcasm flips polarity, set is_sarcastic = true and report the INTENDED sentiment, not the surface sentiment.
4. Sentiment values:
   - positive: clear approval or satisfaction
   - negative: clear complaint or dissatisfaction
   - neutral: factual statements without emotion
   - mixed: contains both positive and negative
5. Output JSON matching the provided schema. No prose outside JSON.`;

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    detected_language: {
      type: SchemaType.STRING,
      enum: ['tamil', 'sinhala', 'english', 'tanglish', 'singlish', 'mixed_other', 'unknown'],
    },
    script: {
      type: SchemaType.STRING,
      enum: ['tamil_native', 'sinhala_native', 'latin', 'mixed'],
    },
    sentiment: {
      type: SchemaType.STRING,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
    },
    sentiment_confidence: { type: SchemaType.NUMBER },
    themes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
        enum: ['service', 'price', 'quality', 'delivery', 'staff', 'food', 'app_ux', 'billing', 'other'],
      },
    },
    is_sarcastic:     { type: SchemaType.BOOLEAN },
    contains_code_mix: { type: SchemaType.BOOLEAN },
    rationale:         { type: SchemaType.STRING },
  },
  required: [
    'detected_language', 'script', 'sentiment', 'sentiment_confidence',
    'themes', 'is_sarcastic', 'contains_code_mix', 'rationale',
  ],
};

async function callModel(modelName: string, text: string): Promise<FeedbackAnalysis> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
      // @ts-expect-error thinkingConfig is supported by Gemini 2.5 Flash but not yet in SDK types
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const result = await model.generateContent(text);
  const raw = result.response.text();
  return FeedbackAnalysisSchema.parse(JSON.parse(raw));
}

export async function analyzeText(text: string): Promise<FeedbackAnalysis & { modelUsed: string }> {
  let modelUsed = env.GEMINI_MODEL;
  console.log('[analyzeText] -> Starting analysis, model:', modelUsed, 'textLen:', text.length);

  try {
    const result = await callModel(modelUsed, text);

    if (result.sentiment_confidence < 0.6) {
      console.log('[analyzeText] -> Low confidence, retrying with Pro. confidence:', result.sentiment_confidence);
      try {
        modelUsed = 'gemini-2.5-pro';
        const retried = await callModel(modelUsed, text);
        console.log('[analyzeText] -> Pro retry succeeded');
        return { ...retried, modelUsed };
      } catch (proErr) {
        console.warn('[analyzeText] -> Pro retry failed, using Flash result:', (proErr as Error).message);
        return { ...result, modelUsed: env.GEMINI_MODEL };
      }
    }

    console.log('[analyzeText] -> Completed. sentiment:', result.sentiment, 'confidence:', result.sentiment_confidence);
    return { ...result, modelUsed };
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      console.warn('[analyzeText] -> Rate limited, falling back to Flash-Lite');
      modelUsed = 'gemini-2.5-flash-lite';
      const result = await callModel(modelUsed, text);
      return { ...result, modelUsed };
    }
    console.error('[analyzeText] -> Failed:', (err as Error).message);
    throw new AppError('Gemini analysis failed', 502);
  }
}
