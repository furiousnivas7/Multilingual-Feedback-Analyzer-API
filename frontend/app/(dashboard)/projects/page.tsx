'use client';

import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A3C5E]">Projects</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Manage your feedback analysis projects</p>
        </div>
        <Button
          className="bg-[#1A3C5E] hover:bg-[#2E75B6]"
          onClick={() => router.push('/projects/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start collecting and analyzing feedback."
          action={{ label: 'Create project', onClick: () => router.push('/projects/new') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#2E75B6] hover:shadow-sm transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[#EFF6FF]">
                    <FolderOpen className="h-5 w-5 text-[#2E75B6]" />
                  </div>
                </div>
                <h3 className="font-semibold text-[#1E293B] truncate">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-1.5 mt-4 text-xs text-[#94A3B8]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{project._count?.feedback ?? 0} feedback entries</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
