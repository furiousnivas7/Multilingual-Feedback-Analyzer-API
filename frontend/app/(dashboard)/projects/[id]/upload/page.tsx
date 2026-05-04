'use client';

import { use, useRef, useState } from 'react';
import { useUploadFile, useBatchJobList, useBatchJob } from '@/hooks/useBatchJob';
import { FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { BatchJobStatus } from '@/types/api';

interface Props {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: BatchJobStatus }) {
  const map: Record<BatchJobStatus, { label: string; class: string }> = {
    queued: { label: 'Queued', class: 'bg-slate-100 text-slate-700' },
    processing: { label: 'Processing', class: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
    partial: { label: 'Partial', class: 'bg-yellow-100 text-yellow-700' },
    failed: { label: 'Failed', class: 'bg-red-100 text-red-700' },
  };
  const { label, class: cls } = map[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
  );
}

function ActiveJob({ jobId }: { jobId: string }) {
  const { data: job } = useBatchJob(jobId);
  if (!job) return null;

  const pct =
    job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {job.status === 'processing' || job.status === 'queued' ? (
            <Loader2 className="h-4 w-4 text-[#2E75B6] animate-spin" />
          ) : job.status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium text-[#1E293B]">{job.filename ?? 'Upload'}</span>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {(job.status === 'processing' || job.status === 'queued') && (
        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full bg-[#2E75B6] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-[#F8FAFC] rounded-lg p-2">
          <p className="text-lg font-bold text-[#1A3C5E]">{job.processedRows}</p>
          <p className="text-xs text-[#64748B]">Processed</p>
        </div>
        <div className="bg-[#F0FDF4] rounded-lg p-2">
          <p className="text-lg font-bold text-green-600">{job.successCount}</p>
          <p className="text-xs text-[#64748B]">Success</p>
        </div>
        <div className="bg-[#FEF2F2] rounded-lg p-2">
          <p className="text-lg font-bold text-red-600">{job.failedCount}</p>
          <p className="text-xs text-[#64748B]">Failed</p>
        </div>
      </div>

      {job.errors && job.errors.length > 0 && (
        <div className="text-xs text-red-600 space-y-1 max-h-24 overflow-y-auto">
          {job.errors.map((e, i) => (
            <p key={i}>Row {e.row}: {e.reason}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UploadPage({ params }: Props) {
  const { id } = use(params);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const upload = useUploadFile(id);
  const { data: jobs } = useBatchJobList(id);

  async function handleFile(file: File) {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('projectId', id);
    const job = await upload.mutateAsync(fd);
    setActiveJobId(job.id);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[#1A3C5E]">Batch Upload</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Upload CSV or Excel files — each row should have a{' '}
          <code className="bg-[#F1F5F9] px-1 rounded text-xs">text</code> column
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragOver
            ? 'border-[#2E75B6] bg-[#EFF6FF]'
            : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2E75B6]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <FileSpreadsheet className="h-10 w-10 text-[#94A3B8] mx-auto mb-3" />
        <p className="text-sm font-medium text-[#1E293B] mb-1">
          Drop your file here or{' '}
          <button
            className="text-[#2E75B6] hover:underline"
            onClick={() => fileRef.current?.click()}
          >
            browse
          </button>
        </p>
        <p className="text-xs text-[#94A3B8]">CSV or Excel (.xlsx) — max 10MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {upload.isPending && (
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading…
        </div>
      )}

      {activeJobId && <ActiveJob jobId={activeJobId} />}

      {jobs && jobs.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Upload History</h2>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">
                    {job.filename ?? 'Upload'}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' · '}
                    {job.totalRows} rows
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
