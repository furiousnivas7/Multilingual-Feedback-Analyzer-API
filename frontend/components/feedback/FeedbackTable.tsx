'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SentimentBadge } from '@/components/analysis/SentimentBadge';
import { LanguageBadge } from '@/components/analysis/LanguageBadge';
import { ThemeChip } from '@/components/analysis/ThemeChip';
import { FeedbackDrawer } from './FeedbackDrawer';
import type { Feedback } from '@/types/api';

interface Props {
  items: Feedback[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FeedbackTable({ items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC]">
              <TableHead className="w-[40%] text-xs font-semibold text-[#64748B]">Feedback</TableHead>
              <TableHead className="text-xs font-semibold text-[#64748B]">Language</TableHead>
              <TableHead className="text-xs font-semibold text-[#64748B]">Sentiment</TableHead>
              <TableHead className="text-xs font-semibold text-[#64748B]">Themes</TableHead>
              <TableHead className="text-xs font-semibold text-[#64748B]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                onClick={() => setSelectedId(item.id)}
              >
                <TableCell className="max-w-xs">
                  <p className="text-sm text-[#1E293B] truncate">{item.rawText}</p>
                  {item.status !== 'completed' && (
                    <span className="text-xs text-[#94A3B8] capitalize">{item.status}</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.analysis ? (
                    <LanguageBadge language={item.analysis.detectedLanguage} />
                  ) : (
                    <span className="text-xs text-[#94A3B8]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.analysis ? (
                    <SentimentBadge sentiment={item.analysis.sentiment} />
                  ) : (
                    <span className="text-xs text-[#94A3B8]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.analysis?.themes.slice(0, 2).map((t) => (
                      <ThemeChip key={t} theme={t} />
                    ))}
                    {(item.analysis?.themes.length ?? 0) > 2 && (
                      <span className="text-xs text-[#64748B]">
                        +{item.analysis!.themes.length - 2}
                      </span>
                    )}
                    {!item.analysis && <span className="text-xs text-[#94A3B8]">—</span>}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-[#64748B] whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FeedbackDrawer
        feedbackId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
