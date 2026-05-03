'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Copy, Trash2, Key, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import type { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from '@/types/api';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  expiresAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const SCOPES = ['feedback:read', 'feedback:write', 'projects:read', 'projects:write', 'analysis:read'];

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['feedback:write']);

  const { data: keys, isLoading } = useQuery<ApiKey[]>({
    queryKey: queryKeys.apiKeys,
    queryFn: async () => {
      const res = await api.get<{ data: ApiKey[] }>('/api/v1/api-keys');
      return res.data.data;
    },
  });

  const create = useMutation<CreateApiKeyResponse, Error, CreateApiKeyRequest>({
    mutationFn: async (body) => {
      const res = await api.post<CreateApiKeyResponse>('/api/v1/api-keys', body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
      setPlaintext(data.plaintext);
      setOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const revoke = useMutation<void, Error, string>({
    mutationFn: async (id) => { await api.delete(`/api/v1/api-keys/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys });
      toast.success('API key revoked');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormValues) {
    create.mutate({
      name: values.name,
      scopes: selectedScopes,
      expiresAt: values.expiresAt || undefined,
    });
    reset();
  }

  function toggleScope(scope: string) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-[#64748B] hover:text-[#1A3C5E]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1A3C5E]">API Keys</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage keys for programmatic access to the API
          </p>
        </div>
      </div>

      <Button
        className="bg-[#1A3C5E] hover:bg-[#2E75B6]"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Generate new key
      </Button>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !keys || keys.length === 0 ? (
        <EmptyState
          title="No API keys"
          description="Generate your first API key to start integrating with the Feedback Analyzer API."
          action={{ label: 'Generate key', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <Key className="h-4 w-4 text-[#2E75B6] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1E293B]">{key.name}</p>
                  <p className="text-xs text-[#94A3B8] font-mono">{key.prefix}…</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {key.scopes.map((s) => (
                      <span key={s} className="text-xs bg-[#EFF6FF] text-[#2E75B6] px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  {key.lastUsedAt && (
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                    </p>
                  )}
                  {key.expiresAt && (
                    <p className="text-xs text-[#94A3B8]">
                      Expires {new Date(key.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                onClick={() => revoke.mutate(key.id)}
                disabled={revoke.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Key name</Label>
              <Input id="key-name" placeholder="e.g. Production App" {...register('name')} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedScopes.includes(scope)
                        ? 'bg-[#1A3C5E] text-white border-[#1A3C5E]'
                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#2E75B6]'
                    }`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expires">Expiry date (optional)</Label>
              <Input id="expires" type="date" {...register('expiresAt')} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1A3C5E] hover:bg-[#2E75B6]"
                disabled={create.isPending || selectedScopes.length === 0}
              >
                Generate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!plaintext} onOpenChange={() => setPlaintext(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mb-3">
            Copy this key now — it will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#F1F5F9] rounded-lg p-3 text-xs font-mono break-all text-[#1E293B]">
              {plaintext}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(plaintext ?? '');
                toast.success('Copied!');
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            className="mt-4 w-full bg-[#1A3C5E] hover:bg-[#2E75B6]"
            onClick={() => setPlaintext(null)}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
