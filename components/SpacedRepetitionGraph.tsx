'use client';

import { animated, useSpring } from '@react-spring/web';
import { useEffect, useState } from 'react';

// Spaced repetition with increasing intervals: 1st review (day 1), 4th (day 5), 6th (day 12)
// Each review boosts retention back up, and declines get progressively shallower
// Filter to show only first 15 days
const allData = {
  labels: [
    0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30,
  ],
  traditional: [
    100, 75, 58, 44, 35, 28, 23, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 9, 8, 8,
    7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4,
  ],
  spaced: [
    100, 65, 100, 89, 100, 94, 89, 85, 100, 96, 93, 91, 89, 87, 85, 83, 100, 97,
    95, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81,
  ],
};

// Filter to first 15 days
const maxDay = 15;
const filteredLabels = allData.labels.filter((day) => day <= maxDay);
const filteredSpaced = allData.spaced.slice(0, filteredLabels.length);
// Set day 15 to 100% for the 4th review
const spacedIndex = filteredLabels.indexOf(15);
if (spacedIndex !== -1) {
  filteredSpaced[spacedIndex] = 100;
}

const data = {
  labels: filteredLabels,
  traditional: allData.traditional.slice(0, filteredLabels.length),
  spaced: filteredSpaced,
};

const PADDING_LEFT = 50;
const PADDING_TOP = 30; // Increased to accommodate labels
const PADDING_BOTTOM = 50;
const PADDING_RIGHT = 20;
const LABEL_TOP_OFFSET = 10; // Space above chart for labels

// Convert data points to SVG path
function createPath(points: number[], width: number, height: number): string {
  const maxX = maxDay;
  const maxY = 100;
  const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const reviewDays = [1, 3, 7, 15];

  const pathParts: string[] = [];

  for (let index = 0; index < points.length; index++) {
    const day = data.labels[index];
    const y = points[index];
    const x = PADDING_LEFT + (day / maxX) * chartWidth;
    const yPos = PADDING_TOP + chartHeight - (y / maxY) * chartHeight;

    // Check if this is a review day (100% retention)
    if (reviewDays.includes(day) && y === 100 && index > 0) {
      // Get the previous point's position
      const prevDay = data.labels[index - 1];
      const prevX = PADDING_LEFT + (prevDay / maxX) * chartWidth;
      const prevY = points[index - 1];
      const prevYPos = PADDING_TOP + chartHeight - (prevY / maxY) * chartHeight;

      // Always draw horizontally to the review day's x position at decayed level first
      // This ensures we're at the correct x before drawing the vertical spike
      pathParts.push(`L ${x} ${prevYPos}`);
      // Then draw straight up vertically to 100% (this creates the vertical spike)
      pathParts.push(`L ${x} ${yPos}`);
    } else {
      // Normal point
      pathParts.push(`${index === 0 ? 'M' : 'L'} ${x} ${yPos}`);
    }
  }

  return pathParts.join(' ');
}

// Calculate approximate path length based on data points
function calculatePathLength(
  points: number[],
  width: number,
  height: number,
): number {
  let length = 0;
  const maxX = maxDay;
  const maxY = 100;
  const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const reviewDays = [1, 3, 7, 15];

  for (let i = 1; i < points.length; i++) {
    const day = data.labels[i];
    const prevDay = data.labels[i - 1];
    const x1 = PADDING_LEFT + (prevDay / maxX) * chartWidth;
    const y1 = PADDING_TOP + chartHeight - (points[i - 1] / maxY) * chartHeight;
    const x2 = PADDING_LEFT + (day / maxX) * chartWidth;
    const y2 = PADDING_TOP + chartHeight - (points[i] / maxY) * chartHeight;

    // Check if this is a review day with vertical spike
    if (reviewDays.includes(day) && points[i] === 100) {
      // First segment: horizontal to review day at decayed level (if x positions differ)
      if (Math.abs(x2 - x1) > 0.1) {
        length += Math.abs(x2 - x1);
      }
      // Second segment: vertical spike up to 100%
      const verticalDy = y1 - y2; // y1 is decayed, y2 is 100%
      length += Math.abs(verticalDy);
    } else {
      // Normal segment
      const dx = x2 - x1;
      const dy = y2 - y1;
      length += Math.sqrt(dx * dx + dy * dy);
    }
  }

  return length;
}

export function SpacedRepetitionGraph() {
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    const element = document.getElementById('srs-graph');
    if (element) {
      observer.observe(element);

      // Set dimensions based on container
      const updateDimensions = () => {
        const rect = element.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width - 80, 600),
          height: 400,
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      return () => {
        window.removeEventListener('resize', updateDimensions);
        if (element) {
          observer.unobserve(element);
        }
      };
    }
  }, []);

  const traditionalPath = createPath(
    data.traditional,
    dimensions.width,
    dimensions.height,
  );
  const spacedPath = createPath(
    data.spaced,
    dimensions.width,
    dimensions.height,
  );

  const traditionalPathLength = calculatePathLength(
    data.traditional,
    dimensions.width,
    dimensions.height,
  );
  const spacedPathLength = calculatePathLength(
    data.spaced,
    dimensions.width,
    dimensions.height,
  );

  // Animate both lines drawing from left to right using stroke-dashoffset
  const traditionalSpring = useSpring({
    strokeDashoffset: isVisible ? 0 : traditionalPathLength,
    config: { duration: 2000 },
  });

  const spacedSpring = useSpring({
    strokeDashoffset: isVisible ? 0 : spacedPathLength,
    config: { duration: 2000, delay: 200 },
  });

  return (
    <div id="srs-graph" className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border-2 border-slate-200">
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Knowledge Retention Over Time
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            Compare{' '}
            <span className="underline decoration-amber-500 decoration-2">
              traditional learning
            </span>{' '}
            vs{' '}
            <span className="underline decoration-blue-600 decoration-2">
              spaced repetition
            </span>
          </p>
        </div>

        <div className="relative" style={{ height: '400px', width: '100%' }}>
          <svg
            viewBox={`0 -${LABEL_TOP_OFFSET} ${dimensions.width} ${dimensions.height + LABEL_TOP_OFFSET}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y-axis line */}
            <line
              x1={PADDING_LEFT}
              y1={PADDING_TOP}
              x2={PADDING_LEFT}
              y2={dimensions.height - PADDING_BOTTOM}
              stroke="#64748b"
              strokeWidth="2"
            />

            {/* X-axis line */}
            <line
              x1={PADDING_LEFT}
              y1={dimensions.height - PADDING_BOTTOM}
              x2={dimensions.width - PADDING_RIGHT}
              y2={dimensions.height - PADDING_BOTTOM}
              stroke="#64748b"
              strokeWidth="2"
            />

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => {
              const chartHeight =
                dimensions.height - PADDING_TOP - PADDING_BOTTOM;
              const y = PADDING_TOP + chartHeight - (value / 100) * chartHeight;
              return (
                <g key={value}>
                  <line
                    x1={PADDING_LEFT}
                    y1={y}
                    x2={dimensions.width - PADDING_RIGHT}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={PADDING_LEFT - 10}
                    y={y}
                    fontSize="12"
                    fill="#64748b"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {value}%
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {[0, 3, 6, 9, 12, 15].map((day) => {
              const chartWidth =
                dimensions.width - PADDING_LEFT - PADDING_RIGHT;
              const x = PADDING_LEFT + (day / maxDay) * chartWidth;
              return (
                <text
                  key={day}
                  x={x}
                  y={dimensions.height - PADDING_BOTTOM + 20}
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {day}
                </text>
              );
            })}

            {/* X-axis title */}
            <text
              x={dimensions.width / 2}
              y={dimensions.height - 5}
              fontSize="14"
              fontWeight="bold"
              fill="#64748b"
              textAnchor="middle"
            >
              Days
            </text>

            {/* Y-axis title */}
            <text
              x="15"
              y={dimensions.height / 2}
              fontSize="14"
              fontWeight="bold"
              fill="#64748b"
              textAnchor="middle"
              transform={`rotate(-90, 15, ${dimensions.height / 2})`}
            >
              Retention %
            </text>

            {/* Review labels */}
            {[
              { day: 1, label: '1st' },
              { day: 3, label: '2nd' },
              { day: 7, label: '3rd' },
              { day: 15, label: '4th' },
            ].map(({ day, label }) => {
              const chartWidth =
                dimensions.width - PADDING_LEFT - PADDING_RIGHT;
              const x = PADDING_LEFT + (day / maxDay) * chartWidth;
              const y = PADDING_TOP - 15; // More gap from data points, positioned above chart area
              return (
                <text
                  key={day}
                  x={x}
                  y={y}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#2563eb"
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            })}

            {/* Traditional learning line (amber) */}
            <animated.path
              d={traditionalPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={traditionalPathLength}
              style={{
                strokeDashoffset: traditionalSpring.strokeDashoffset,
              }}
            />

            {/* Spaced repetition line (blue) */}
            <animated.path
              d={spacedPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={spacedPathLength}
              style={{
                strokeDashoffset: spacedSpring.strokeDashoffset,
              }}
            />

            {/* Data points for spaced repetition at review intervals */}
            {[1, 3, 7, 15].map((day) => {
              const index = data.labels.indexOf(day);
              if (index === -1) return null;
              const chartWidth =
                dimensions.width - PADDING_LEFT - PADDING_RIGHT;
              const chartHeight =
                dimensions.height - PADDING_TOP - PADDING_BOTTOM;
              const x = PADDING_LEFT + (day / maxDay) * chartWidth;
              const y =
                PADDING_TOP +
                chartHeight -
                (data.spaced[index] / 100) * chartHeight;
              return (
                <circle
                  key={day}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#2563eb"
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* Key insights */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">25x</div>
            <div className="text-sm text-slate-700">
              Better retention after 15 days
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">90%+</div>
            <div className="text-sm text-slate-700">
              Knowledge retained with reviews
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">50%</div>
            <div className="text-sm text-slate-700">
              Less time needed to master concepts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
