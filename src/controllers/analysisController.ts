import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import { buildReport } from '../services/reportService';
import { aggregateThemes } from '../services/themeService';
import { buildPdfBuffer } from '../utils/pdfExport';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { prisma } from '../lib/prisma';

export const getReport = catchAsync<AuthRequest>(async (req, res: Response): Promise<void> => {
  const report = await buildReport(req.params.projectId as string, req.userId!);
  res.json({ success: true, data: report });
});

export const getSentiment = catchAsync<AuthRequest>(async (req, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
  if (!project) throw new AppError('Project not found', 404);

  const rows = await prisma.analysis.findMany({
    where: { feedback: { projectId } },
    select: { sentiment: true, confidence: true },
  });

  const countMap: Record<string, number> = {};
  const confSum: Record<string, number> = {};
  for (const r of rows) {
    countMap[r.sentiment] = (countMap[r.sentiment] ?? 0) + 1;
    confSum[r.sentiment]  = (confSum[r.sentiment]  ?? 0) + r.confidence;
  }

  const breakdown: Record<string, { count: number; avgConfidence: number }> = {};
  for (const sentiment of Object.keys(countMap)) {
    breakdown[sentiment] = {
      count: countMap[sentiment]!,
      avgConfidence: parseFloat(((confSum[sentiment] ?? 0) / countMap[sentiment]!).toFixed(3)),
    };
  }

  res.json({ success: true, data: { projectId, breakdown } });
});

export const getThemes = catchAsync<AuthRequest>(async (req, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
  if (!project) throw new AppError('Project not found', 404);

  const analyses = await prisma.analysis.findMany({
    where: { feedback: { projectId } },
    select: { themes: true, confidence: true, sentiment: true },
  });

  res.json({ success: true, data: { projectId, themes: aggregateThemes(analyses) } });
});

export const exportReport = catchAsync<AuthRequest>(async (req, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const rawFormat = req.query['format'];
  const format = Array.isArray(rawFormat) ? rawFormat[0] : (rawFormat as string | undefined) ?? 'json';

  const report = await buildReport(projectId, req.userId!);

  if (format === 'pdf') {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const buf = await buildPdfBuffer({
      projectName: project?.name ?? 'Unknown',
      totalFeedback: report.totalFeedback,
      sentimentBreakdown: report.sentimentBreakdown,
      languageBreakdown: report.languageBreakdown,
      topThemes: report.topThemes,
      priorityAlerts: report.priorityAlerts,
      trendDirection: report.trendDirection,
      generatedAt: new Date().toISOString(),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${projectId}.pdf"`);
    res.send(buf);
    return;
  }

  res.json({ success: true, data: report });
});
