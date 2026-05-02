'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubmitFeedback } from '@/hooks/useFeedback';

const schema = z.object({
  text: z.string().min(5, 'Feedback must be at least 5 characters').max(5000),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  projectId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ projectId, onSuccess }: Props) {
  const submit = useSubmitFeedback(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await submit.mutateAsync({
      projectId,
      text: values.text,
      source: 'manual',
    });
    reset();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="feedback-text">Feedback text</Label>
        <Textarea
          id="feedback-text"
          rows={4}
          placeholder="Paste or type feedback in any language (Tamil, Sinhala, English, Singlish, Tanglish)…"
          className="resize-none text-sm"
          aria-describedby={errors.text ? 'text-error' : undefined}
          {...register('text')}
        />
        {errors.text && (
          <p id="text-error" className="text-xs text-red-600">{errors.text.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="bg-[#1A3C5E] hover:bg-[#2E75B6]"
        disabled={submit.isPending}
      >
        {submit.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          'Analyze feedback'
        )}
      </Button>
    </form>
  );
}
