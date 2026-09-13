import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarAxis {
  label: string;
  value: number;
  color: string;
}

interface RadarChartProps {
  axes: RadarAxis[];
  max?: number;
}

// Attribute radar chart, built with Recharts per the design brief. Values
// come straight from the backend profile — nothing here is computed or
// guessed client-side.
export const RadarChart = ({ axes, max = 100 }: RadarChartProps) => {
  const data = axes.map((axis) => ({ subject: axis.label, value: axis.value, fullMark: max }));

  return (
    <div className="w-full h-[260px]" role="img" aria-label="Attribute radar chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#2A3F5C" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#8CA6C4', fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, max]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Attributes"
            dataKey="value"
            stroke="#4DA6FF"
            fill="#4DA6FF"
            fillOpacity={0.35}
            strokeWidth={2}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
