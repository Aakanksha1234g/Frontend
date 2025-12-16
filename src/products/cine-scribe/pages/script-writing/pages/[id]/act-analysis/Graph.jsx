import React from 'react';
import { Line, XAxis, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { Card } from '@heroui/react';

const GraphVisualizer = ({ graph_data }) => {
  const { act_names = [], ...rest } = graph_data || {};
  const categories = Object.keys(rest).filter(
    key => !key.endsWith('_analysis')
  );

  const toRoman = num => {
    const romans = ['I', 'II', 'III', 'IV', 'V'];
    return romans[num - 1] || num;
  };

  // Prepare chart data
  const chartData =
    act_names.length && categories.length
      ? act_names.map((act, index) => {
          const obj = { act: `Act ${toRoman(index + 1)}`, pv: 15 };
          categories.forEach(category => {
            obj[category] = graph_data[category]?.[index] || 0;
          });
          return obj;
        })
      : [];

  const formatTitle = str =>
    str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

  const getGraphDescription = category => {
    const descriptions = {
      plot_and_theme:
        "Represents how prominent and clear the story's theme is in each act.",
      emotional_intensity: 'Shows how emotionally charged each act is.',
      set_up_and_payoff:
        'Highlights how well setups and payoffs are executed in each act.',
      conflicts: 'Measures the level of conflict and obstacles in the story.',
    };
    return (
      descriptions[category] ||
      'This graph provides insights into key storytelling aspects.'
    );
  };

  return (
    <div className="w-full mx-auto">
      {categories.length > 0 ? (
        <div className="w-full grid grid-cols-2 xl:grid-cols-4 gap-4 justify-center">
          {categories.map(category => (
            <Card
              key={category}
              className="text-center flex flex-col gap-2 justify-between flex-1 p-4"
            >
              <div className="text-sm text-[#737373]">
                <h2 className="text-medium font-semibold text-[#fcfcfc]">
                  {formatTitle(category)}
                </h2>
                {getGraphDescription(category)} <br />
                {/* <span className="text-[#2E90FA] cursor-pointer">Show more</span> */}
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#1F2D97" />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="act"
                    padding={{ left: 20, right: 20 }}
                    axisLine={false}
                    tickLine={false}
                    className="text-[#737373]"
                  />

                  <Bar
                    className="opacity-20"
                    dataKey="pv"
                    barSize={50}
                    fill="url(#barGradient)"
                    radius={[3, 3, 0, 0]}
                  />

                  <Line
                    type="monotone"
                    dataKey={category}
                    stroke="#344BFD"
                    strokeWidth={2}
                    dot={{ r: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No graph data available</div>
      )}
    </div>
  );
};

export default GraphVisualizer;
