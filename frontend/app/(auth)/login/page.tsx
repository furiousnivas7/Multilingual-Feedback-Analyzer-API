'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLogin } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setErrorMsg('');
    try {
      await login.mutateAsync(values);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes('429') || msg.toLowerCase().includes('many attempts')) {
        setErrorMsg('Too many attempts. Try again in 15 minutes.');
      } else {
        setErrorMsg('Invalid email or password');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] to-[#E2E8F0] px-4">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-7 w-7 text-[#1A3C5E]" />
            <span className="text-xl font-bold text-[#1A3C5E]">Feedback Analyzer</span>
          </div>
          <p className="text-sm text-[#64748B]">Sign in to your account</p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoFocus
              placeholder="Enter your email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pr-10"
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[#64748B] hover:text-[#1E293B]"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register('remember')}
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1A3C5E] hover:bg-[#2E75B6]"
            disabled={login.isPending}
          >
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#2E75B6] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
