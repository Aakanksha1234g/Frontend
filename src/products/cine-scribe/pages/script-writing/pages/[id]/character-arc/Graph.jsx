import { Card, CardHeader, CardTitle, CardDescription } from '@shared/ui/card';
import { useEffect, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ReferenceArea,
  YAxis,
} from 'recharts';
import { useUser } from '@shared/context/user-context';
import CharacterArcPdfDownloadButton from './DownloadPdf';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import downloadIcon from '@assets/icons/DownloadMinimalistic.svg';
import html2canvas from 'html2canvas';
import { RiseIcon, FallIcon } from '@shared/layout/icons';

//  Intensity color map
const intensityColorMap = {
  High: '#4CAF50',
  Medium: '#FFC107',
  Low: '#F44336',
};

const getIntensity = score => {
  if (score > 8) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

export default function CharacterArcChart({ graph_data = [], data }) {
  const chartRef = useRef(null);
  const [hasCaptured, setHasCaptured] = useState(false);
  const { state: profileState } = useUser();
  const [graphImages, setGraphImages] = useState(null);
  useEffect(() => {
    if (!hasCaptured && chartRef.current && graph_data.length) {
      // Wait for DOM to paint
      setTimeout(() => {
        html2canvas(chartRef.current).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          setGraphImages(imgData);
          setHasCaptured(true);
        });
      }, 1100); // 300ms delay
    }
  }, [graph_data, hasCaptured]);

  if (!graph_data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Character Arc Progression</CardTitle>
          <CardDescription>No data available to display.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const processedData = graph_data.map(item => ({
    label: item.label.replace(/_/g, ' '),
    score: item.score,
    color: intensityColorMap[getIntensity(item.score)],
  }));

  return (
    <div className="p-6 bg-black rounded-lg items-center relative">
      {/* Chart + Legend Wrapper */}
      <div className="w-full flex justify-center">
        <div className="w-full responsive-container">
          {/* Chart Section */}
          <div ref={chartRef} className="relative">
            {/* 🔹 Top Highlight Overlay */}
            <div />
            {/* Beat Graph */}
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#E5E5E5' }}
                  padding={{ left: 0, right: 20 }}
                  tickFormatter={label => label.split('_').join(' ')}
                  className="capitalize"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    let label = '';
                    if (payload.value === 9) label = 'High';
                    else if (payload.value === 5) label = 'Mid';
                    else if (payload.value === 1) label = 'Low';

                    return (
                      <text
                        x={x - 10}
                        y={y + 4}
                        textAnchor="end"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="500"
                      >
                        {label}
                      </text>
                    );
                  }}
                  ticks={[1, 5, 9]}
                  label={{
                    value: 'Character Growth',
                    angle: -90,
                    position: 'outsideLeft',
                    fill: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    dx: -25,
                  }}
                />

                <ReferenceLine
                  x={processedData[3]?.label}
                  stroke="#ff7300"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: 'Intermission',
                    position: 'top',
                    fill: '#ff7300',
                    fontSize: 14,
                  }}
                />

                <ReferenceArea y1={6.66} y2={10} fill="#2B3695" opacity={0.8} />
                <ReferenceArea
                  y1={3.33}
                  y2={6.66}
                  fill="#6976EB"
                  opacity={0.8}
                />
                <ReferenceArea y1={0} y2={3.33} fill="#53B1FD" opacity={0.8} />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.9}
                />

                <Line
                  animationDuration={1000}
                  type="monotone"
                  dataKey="score"
                  stroke="#6976EB"
                  strokeWidth={2}
                  dot={({ cx, cy }) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#6976EB"
                      style={{
                        filter: 'drop-shadow(0 0 6px #6976EB)',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  )}
                  activeDot={({ cx, cy }) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={12}
                      fill="url(#glowGradient)"
                      style={{
                        opacity: 0.9,
                        filter: 'drop-shadow(0 0 20px #6976EB)',
                        transition: 'all 0.1s ease-in-out',
                      }}
                    />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex lg:flex-row gap-3 w-[90%] items-center mx-auto">
            {/* How to Read */}
            <div className="flex-1 border rounded-lg border-gray-900 p-3 ">
              <div className="flex items-center gap-2">
                <RiseIcon size={24} />
                <p className="text-sm font-semibold text-[#737373]">
                  Indicates emotional tension or audience thrill.
                </p>
              </div>
              <div className="w-full h-px bg-white my-4 opacity-40"></div>

              <div className="flex items-center gap-2 mt-3">
                <FallIcon size={24} />
                <p className="text-sm font-semibold text-[#737373]">
                  Indicates a narrative transition or breathing room.
                </p>
              </div>
            </div>

            {/* High / Medium / Low Cards */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="p-2 border rounded-md border-gray-900 flex items-start relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-md"
                  style={{ background: '#2B3695', opacity: '0.8' }}
                ></div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-[#E5E5E5]">
                    High
                  </span>
                  <p className="text-[#A3A3A3] text-xs mt-1">
                    Climactic moments, major reveals, or intense action
                  </p>
                </div>
              </div>

              <div className="p-2 border rounded-md border-gray-900 flex items-start relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-1  rounded-l-md"
                  style={{ background: '#6976EB', opacity: '0.8' }}
                ></div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-[#E5E5E5]">
                    Medium
                  </span>
                  <p className="text-[#A3A3A3] text-xs mt-1">
                    Character development, plot progression, or setup
                  </p>
                </div>
              </div>

              <div className="p-2 border rounded-md border-gray-900 flex items-start relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-1  rounded-l-md"
                  style={{ background: '#53B1FD', opacity: '0.8' }}
                ></div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-[#E5E5E5]">
                    Low
                  </span>
                  <p className="text-[#A3A3A3] text-xs mt-1">
                    Exposition, transitions, or breathing moments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};
