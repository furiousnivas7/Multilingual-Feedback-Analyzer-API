import { aggregateThemes } from './themeService';
import { sentimentScore } from './sentimentService';
import { AppError } from '../utils/AppError';
import { prisma } from '../lib/prisma';

export interface AggregateReport {
  projectId: string;
  totalFeedback: number;
  sentimentBreakdown: Record<string, number>;
  languageBreakdown: Record<string, number>;
  topThemes: Array<{ theme: string; count: number; avgSentiment: number }>;
  priorityAlerts: number;
  trendDirection: string;
}

export async function buildReport(projectId: string, userId: string): Promise<AggregateReport> {
  console.log('[buildReport] -> Starting for projectId:', projectId);

  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new AppError('Project not found', 404);

  const analyses = await prisma.analysis.findMany({
    where: { feedback: { projectId } },
    select: { sentiment: true, confidence: true, detectedLang: true, themes: true },
  });

  const total = analyses.length;
  const sentimentBreakdown: Record<string, number> = {};
  const languageBreakdown: Record<string, number> = {};

  for (const a of analyses) {
    sentimentBreakdown[a.sentiment] = (sentimentBreakdown[a.sentiment] ?? 0) + 1;
    languageBreakdown[a.detectedLang] = (languageBreakdown[a.detectedLang] ?? 0) + 1;
  }

  const topThemes = aggregateThemes(
    analyses.map((a) => ({ themes: a.themes, confidence: a.confidence, sentiment: a.sentiment }))
  ).slice(0, 10);

  const priorityAlerts = analyses.filter((a) => a.sentiment === 'negative' && a.confidence > 0.8).length;

  const toScore = (a: { sentiment: string; confidence: number }) =>
    sentimentScore(a.sentiment as 'positive' | 'negative' | 'neutral' | 'mixed', a.confidence);

  const recentAvg = analyses.slice(-50).reduce((s, a) => s + toScore(a), 0) / Math.max(analyses.slice(-50).length, 1);
  const olderAvg  = analyses.slice(0, Math.max(0, total - 50)).reduce((s, a) => s + toScore(a), 0) / Math.max(total - 50, 1);
  const trendDirection = total < 10 ? 'insufficient data' : recentAvg > olderAvg ? 'improving' : 'declining';

  console.log('[buildReport] -> Completed. total:', total, 'trend:', trendDirection);
  return { projectId, totalFeedback: total, sentimentBreakdown, languageBreakdown, topThemes, priorityAlerts, trendDirection };
}
