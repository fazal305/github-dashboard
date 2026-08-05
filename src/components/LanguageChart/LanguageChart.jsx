import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { useThemeContext } from '../../context/ThemeContext.jsx';
import { DEFAULT_LANGUAGE_COLOR, LANGUAGE_COLORS } from '../../utils/constants.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CHART_COMPONENTS = { pie: Pie, bar: Bar, doughnut: Doughnut };
const FALLBACK_CHART_COLOR_COUNT = 8;

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resolveColors(labels) {
  let fallbackIndex = 0;
  return labels.map((label) => {
    if (LANGUAGE_COLORS[label]) return LANGUAGE_COLORS[label];
    const color = getCssVar(`--chart-color-${(fallbackIndex % FALLBACK_CHART_COLOR_COUNT) + 1}`);
    fallbackIndex += 1;
    return color || DEFAULT_LANGUAGE_COLOR;
  });
}

function LanguageChart({ type = 'doughnut', labels = [], values = [] }) {
  const { resolvedTheme } = useThemeContext();
  const ChartComponent = CHART_COMPONENTS[type] ?? Doughnut;

  const { data, options } = useMemo(() => {
    const colors = resolveColors(labels);
    const textColor = getCssVar('--color-text-secondary');
    const gridColor = getCssVar('--chart-grid-color');
    const tickColor = getCssVar('--chart-tick-color');
    const surfaceColor = getCssVar('--color-surface');

    const isBar = type === 'bar';

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Repositories',
            data: values,
            backgroundColor: colors,
            borderColor: isBar ? colors : surfaceColor,
            borderWidth: isBar ? 0 : 2,
            borderRadius: isBar ? 6 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: !isBar,
            position: 'bottom',
            labels: { color: textColor, usePointStyle: true, boxWidth: 8 },
          },
          tooltip: {
            backgroundColor: surfaceColor,
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
          },
        },
        scales: isBar
          ? {
              x: { ticks: { color: tickColor }, grid: { color: gridColor } },
              y: { ticks: { color: tickColor }, grid: { color: gridColor }, beginAtZero: true },
            }
          : undefined,
      },
    };
    // resolvedTheme isn't read above but forces a recompute of the CSS custom properties when the theme flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels, values, type, resolvedTheme]);

  const summary = labels.map((label, index) => `${label}: ${values[index]}`).join(', ');

  return (
    <div className="gd-chart-container" role="img" aria-label={`${type} chart. ${summary}`}>
      <ChartComponent data={data} options={options} aria-hidden="true" />
    </div>
  );
}

export default LanguageChart;
