'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { ThemeStat } from '@/types/api';

const THEME_LABELS: Record<string, string> = {
  service: 'Service',
  price: 'Price',
  quality: 'Quality',
  delivery: 'Delivery',
  staff: 'Staff',
  food: 'Food',
  app_ux: 'App UX',
  billing: 'Billing',
  other: 'Other',
};

interface Props {
  data: ThemeStat[];
}

export function ThemeBarChart({ data }: Props) {
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map((d) => ({
      name: THEME_LABELS[d.theme] ?? d.theme,
      count: d.count,
      sentiment: d.avgSentiment,
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          width={64}
          tick={{ fontSize: 12, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill="#2E75B6" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
