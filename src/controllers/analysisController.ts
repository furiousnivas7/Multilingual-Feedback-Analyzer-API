import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';
import { buildReport } from '../services/reportService';
import { aggregateThemes } from '../services/themeService';
import { buildPdfBuffer } from '../utils/pdfExport';

const prisma = new PrismaClient();

export async function getReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const report = await buildReport(req.params['projectId']!, req.userId!);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function getSentiment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params['projectId']!;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }

    const rows = await prisma.analysis.groupBy({
      by: ['sentiment'],
      where: { feedback: { projectId } },
      _count: { sentiment: true },
      _avg: { confidence: true },
    });

    const breakdown = rows.reduce<Record<string, { count: number; avgConfidence: number }>>((acc, r) => {
      acc[r.sentiment] = { count: r._count.sentiment, avgConfidence: parseFloat((r._avg.confidence ?? 0).toFixed(3)) };
      return acc;
    }, {});

    res.json({ success: true, data: { projectId, breakdown } });
  } catch (err) { next(err); }
}

export async function getThemes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params['projectId']!;
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }

    const analyses = await prisma.analysis.findMany({
      where: { feedback: { projectId } },
      select: { themes: true, confidence: true, sentiment: true },
    });

    const themes = aggregateThemes(analyses);
    res.json({ success: true, data: { projectId, themes } });
  } catch (err) { next(err); }
}

export async function exportReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const format = (req.query['format'] as string) || 'json';
    const report = await buildReport(req.params['projectId']!, req.userId!);

    if (format === 'pdf') {
      const project = await prisma.project.findUnique({ where: { id: req.params['projectId'] } });
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
      res.setHeader('Content-Disposition', `attachment; filename="report-${req.params['projectId']}.pdf"`);
      res.send(buf);
    } else {
      res.json({ success: true, data: report });
    }
  } catch (err) { next(err); }
}
