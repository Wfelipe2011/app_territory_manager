import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { memo } from 'react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  values: number[];
  labels?: string[];
  backgroundColor?: string[];
  borderColor?: string[];
}

const DoughnutChartComponent = ({ labels, values, backgroundColor, borderColor }: DoughnutChartProps) => {
  if (!values) return null;
  return (
    <Doughnut
      options={{
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        labels: labels ?? [],
        datasets: [
          {
            label: '#',
            data: values,
            backgroundColor: backgroundColor ?? ['#9EE073', '#CBE6BA'],
            borderColor: borderColor ?? ['#9EE073', '#CBE6BA'],
            borderWidth: 1,
          },
        ],
      }}
    />
  );
};

export const DoughnutChart = memo(DoughnutChartComponent);
