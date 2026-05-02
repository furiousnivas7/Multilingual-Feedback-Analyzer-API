'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { DetectedLanguage } from '@/types/api';

const LANGUAGE_COLORS: Record<string, string> = {
  tamil: '#A855F7',
  sinhala: '#3B82F6',
  english: '#64748B',
  singlish: '#06B6D4',
  tanglish: '#6366F1',
  mixed_other: '#F97316',
  unknown: '#94A3B8',
};

const LANGUAGE_LABELS: Record<string, string> = {
  tamil: 'Tamil',
  sinhala: 'Sinhala',
  english: 'English',
  singlish: 'Singlish',
  tanglish: 'Tanglish',
  mixed_other: 'Mixed',
  unknown: 'Unknown',
};

interface Props {
  data: Partial<Record<DetectedLanguage, number>>;
}

export function LanguageDonut({ data }: Props) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: LANGUAGE_LABELS[key] ?? key,
      value,
      color: LANGUAGE_COLORS[key] ?? '#94A3B8',
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
