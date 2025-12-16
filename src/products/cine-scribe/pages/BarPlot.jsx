import React, { PureComponent } from 'react';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { categories, descriptions } from '../constants/ProductConstants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          width: '200px',
          background: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          textAlign: 'left', // Ensures all text inside aligns left
        }}
      >
        <p style={{ margin: '5px 0' }}>
          <strong>{label}:</strong> {descriptions[label]}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.fill, margin: 0 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default class CategoryBarChart extends PureComponent {
  render() {
    const { bar_data } = this.props;

    const chartData = categories.map((category, index) => ({
      name: category,
      liked: bar_data?.liked?.[index] ?? 0,
      disliked: bar_data?.disliked?.[index] ?? 0,
    }));

    return (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            animationDuration={3000}
            animationEasing="ease-in-out"
          >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis tick={{ fontSize: 12 }} dataKey="name" />
            <YAxis tick={{ fontSize: 12 }}>
              <Label
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle', fontSize: 14 }}
              >
                Audience Reviews
              </Label>
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="liked"
              fill="rgba(5, 109, 223, 1)"
              name="Appreciated"
              radius={[5, 5, 0, 0]}
              animationBegin={0}
            />
            <Bar
              dataKey="disliked"
              fill="rgba(156, 163, 175, 1)"
              name="Criticized"
              radius={[5, 5, 0, 0]}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
        <h2 style={{ marginBottom: 10, fontWeight: 'bold' }}>
          Audience Reactions Across Core Movie Elements
        </h2>
      </div>
    );
  }
}
