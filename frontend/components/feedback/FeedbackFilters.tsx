'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const SENTIMENTS = ['positive', 'negative', 'neutral', 'mixed'];
const LANGUAGES = ['tamil', 'sinhala', 'english', 'singlish', 'tanglish', 'mixed_other'];
const THEMES = ['service', 'price', 'quality', 'delivery', 'staff', 'food', 'app_ux', 'billing', 'other'];

export function FeedbackFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = ['sentiment', 'lang', 'theme', 'search'].some((k) => searchParams.has(k));

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        placeholder="Search feedback…"
        className="w-48 h-9 text-sm"
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => update('search', e.target.value)}
      />

      <Select
        value={searchParams.get('sentiment') ?? 'all'}
        onValueChange={(v) => update('sentiment', v)}
      >
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sentiments</SelectItem>
          {SENTIMENTS.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('lang') ?? 'all'}
        onValueChange={(v) => update('lang', v)}
      >
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All languages</SelectItem>
          {LANGUAGES.map((l) => (
            <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('theme') ?? 'all'}
        onValueChange={(v) => update('theme', v)}
      >
        <SelectTrigger className="w-[120px] h-9 text-sm">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All themes</SelectItem>
          {THEMES.map((t) => (
            <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 text-sm text-[#64748B]">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
