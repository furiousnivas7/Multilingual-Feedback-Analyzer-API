'use client';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { SentimentBadge } from '@/components/analysis/SentimentBadge';
import { LanguageBadge } from '@/components/analysis/LanguageBadge';
import { ThemeChip } from '@/components/analysis/ThemeChip';
import { useFeedbackDetail } from '@/hooks/useFeedback';
import { Progress } from '@/components/ui/progress';

interface Props {
  feedbackId: string | null;
  open: boolean;
  onClose: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-xs font-medium text-[#64748B] shrink-0">{label}</span>
      <div className="text-sm text-[#1E293B] text-right">{children}</div>
    </div>
  );
}

export function FeedbackDrawer({ feedbackId, open, onClose }: Props) {
  const { data, isLoading } = useFeedbackDetail(feedbackId ?? '');

  return (
    <Drawer open={open} onClose={onClose} direction="right">
      <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none">
        <DrawerHeader className="border-b border-[#E2E8F0] pb-4">
          <DrawerTitle className="text-base font-semibold text-[#1A3C5E]">
            Feedback Detail
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : data ? (
            <>
              <div>
                <p className="text-xs font-medium text-[#64748B] mb-2">Raw Text</p>
                <p className="text-sm text-[#1E293B] whitespace-pre-wrap leading-relaxed bg-[#F8FAFC] rounded-lg p-3">
                  {data.rawText}
                </p>
              </div>

              {data.analysis && (
                <>
                  <div>
                    <p className="text-xs font-medium text-[#64748B] mb-3">Analysis</p>
                    <div className="bg-white rounded-lg border border-[#E2E8F0] px-4 divide-y divide-[#F1F5F9]">
                      <Row label="Language">
                        <LanguageBadge language={data.analysis.detectedLanguage} />
                      </Row>
                      <Row label="Sentiment">
                        <SentimentBadge
                          sentiment={data.analysis.sentiment}
                          confidence={data.analysis.confidence}
                        />
                      </Row>
                      <Row label="Confidence">
                        <div className="flex items-center gap-2 justify-end">
                          <Progress
                            value={data.analysis.confidence * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-xs text-[#64748B]">
                            {Math.round(data.analysis.confidence * 100)}%
                          </span>
                        </div>
                      </Row>
                      <Row label="Script">{data.analysis.scriptType.replace('_', ' ')}</Row>
                      <Row label="Sarcastic">{data.analysis.isSarcastic ? 'Yes' : 'No'}</Row>
                      <Row label="Code-mix">{data.analysis.containsCodeMix ? 'Yes' : 'No'}</Row>
                      <Row label="Model">{data.analysis.modelUsed}</Row>
                      <Row label="Latency">
                        {data.analysis.latencyMs != null
                          ? `${data.analysis.latencyMs}ms`
                          : '—'}
                      </Row>
                    </div>
                  </div>

                  {data.analysis.themes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#64748B] mb-2">Themes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.analysis.themes.map((t) => (
                          <ThemeChip key={t} theme={t} />
                        ))}
                      </div>
                    </div>
                  )}

                  {data.analysis.rationale && (
                    <div>
                      <p className="text-xs font-medium text-[#64748B] mb-2">Rationale</p>
                      <p className="text-sm text-[#475569] leading-relaxed bg-[#F8FAFC] rounded-lg p-3">
                        {data.analysis.rationale}
                      </p>
                    </div>
                  )}
                </>
              )}

              <Row label="Source">{data.source.replace('_', ' ')}</Row>
              <Row label="Status">
                <span className="capitalize">{data.status}</span>
              </Row>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
