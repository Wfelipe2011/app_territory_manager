'use client';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { memo, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  values: number[];
}

const getCSSVariable = (variableName: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
};


const DoughnutChartComponent = ({ values }: DoughnutChartProps) => {
  const [colors, setColors] = useState({
    backgroundColor: ['#9EE073', '#DDF5CE'], // Valores padrão
    borderColor: ['#9EE073', '#DDF5CE'], // Valores padrão
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setColors({
        backgroundColor: [
          getCSSVariable('--color-primary'),
          getCSSVariable('--color-secondary'),
        ],
        borderColor: [
          getCSSVariable('--color-primary'),
          getCSSVariable('--color-secondary'),
        ],
      });
    }
  }, []);


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
        labels: [],
        datasets: [
          {
            label: '#',
            data: values,
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            borderWidth: 1,
          },
        ],
      }}
    />
  );
};

export const DoughnutChart = memo(DoughnutChartComponent);
