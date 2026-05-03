'use client';

import { useCurrentUser } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLogout } from '@/hooks/useAuth';
import { KeyRound, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  timezone: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', timezone: user?.timezone ?? 'UTC' },
  });

  async function onSave(values: ProfileValues) {
    try {
      await api.patch('/api/v1/auth/me', values);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-[#1A3C5E]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Manage your account preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-[#2E75B6]" />
          <h2 className="text-sm font-semibold text-[#1E293B]">Profile</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled className="bg-[#F8FAFC]" />
              <p className="text-xs text-[#94A3B8]">Email cannot be changed</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...register('timezone')} placeholder="UTC" />
            </div>

            <Button
              type="submit"
              className="bg-[#1A3C5E] hover:bg-[#2E75B6]"
              disabled={isSubmitting}
            >
              Save changes
            </Button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-[#2E75B6]" />
          <h2 className="text-sm font-semibold text-[#1E293B]">API Keys</h2>
        </div>
        <p className="text-sm text-[#64748B] mb-4">
          Generate API keys to access the Feedback Analyzer API programmatically.
        </p>
        <Link href="/settings/api-keys">
          <Button variant="outline" size="sm">
            Manage API keys
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <Separator className="mb-5" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1E293B]">Sign out</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">Sign out of your account on this device</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
