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
import { useRegister } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const register = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setErrorMsg('');
    try {
      await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes('already')) {
        setErrorMsg('An account with this email already exists.');
      } else {
        setErrorMsg(msg || 'Registration failed. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] to-[#E2E8F0] px-4">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-7 w-7 text-[#1A3C5E]" />
            <span className="text-xl font-bold text-[#1A3C5E]">Feedback Analyzer</span>
          </div>
          <p className="text-sm text-[#64748B]">Create your account</p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              autoFocus
              placeholder="Enter your name"
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...registerField('name')}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...registerField('email')}
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
                placeholder="At least 8 characters"
                className="pr-10"
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...registerField('password')}
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className="pr-10"
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                {...registerField('confirmPassword')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[#64748B] hover:text-[#1E293B]"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-error" className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1A3C5E] hover:bg-[#2E75B6]"
            disabled={register.isPending}
          >
            {register.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2E75B6] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
