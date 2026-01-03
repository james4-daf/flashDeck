'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AttemptHistoryData {
  date: string;
  correct: number;
  incorrect: number;
  total: number;
  accuracy: number;
}

interface AttemptHistoryChartProps {
  data: AttemptHistoryData[];
  categoryName: string;
}

export function AttemptHistoryChart({
  data,
  categoryName,
}: AttemptHistoryChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Attempt History - {categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Attempt History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm sm:text-base">
              No attempt history yet. Start studying to see your progress!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date for display (MM/DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Calculate overall stats
  const totalCorrect = data.reduce((sum, day) => sum + day.correct, 0);
  const totalIncorrect = data.reduce((sum, day) => sum + day.incorrect, 0);
  const totalAttempts = totalCorrect + totalIncorrect;
  const overallAccuracy =
    totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          Attempt History - {categoryName}
        </CardTitle>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
          <div>
            <span className="font-medium">Total Attempts:</span> {totalAttempts}
          </div>
          <div>
            <span className="font-medium">Correct:</span>{' '}
            <span className="text-green-600">{totalCorrect}</span>
          </div>
          <div>
            <span className="font-medium">Incorrect:</span>{' '}
            <span className="text-red-600">{totalIncorrect}</span>
          </div>
          <div>
            <span className="font-medium">Accuracy:</span>{' '}
            <span className="text-blue-600">{overallAccuracy.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bar Chart - Correct vs Incorrect */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Daily Attempts
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  style={{ fontSize: '12px' }}
                />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    value ?? 0,
                    name === 'correct' ? 'Correct' : 'Incorrect',
                  ]}
                />
                <Legend />
                <Bar dataKey="correct" fill="#22c55e" name="Correct" />
                <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Accuracy Over Time */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Accuracy Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={[0, 100]}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Accuracy']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Accuracy %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

