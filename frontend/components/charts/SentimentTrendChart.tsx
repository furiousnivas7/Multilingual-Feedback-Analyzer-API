'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { SentimentTrendPoint } from '@/types/api';

const COLORS = {
  positive: '#22C55E',
  negative: '#EF4444',
  neutral: '#94A3B8',
  mixed: '#F59E0B',
};

interface Props {
  data: SentimentTrendPoint[];
}

export function SentimentTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8' }}
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
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="mixed" stroke={COLORS.mixed} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
