import { ECharts } from 'echarts';
import moment from 'moment';

import Decimal from 'decimal.js';
import { buildGanttChart, buildMarkArea, buildMarkLine, buildCurrentDateLine } from './series';

export function switchLegends(legends: string[], show: boolean, chartInstance: ECharts) {
  legends.forEach((legend) => {
    chartInstance.dispatchAction({
      type: show ? 'legendSelect' : 'legendUnSelect',
      name: legend,
    });
  });
}

export function legendAllUnSelect(chartInstance: ECharts) {
  chartInstance.dispatchAction({
    type: 'legendAllSelect',
  });

  chartInstance.dispatchAction({
    type: 'legendInverseSelect',
  });
}

export function buildSeries(gantt: any, verticalLine: any, label: boolean, h: boolean, config: any) {
  const series: any = [];

  series.push(buildCurrentDateLine());

  verticalLine.forEach((item: any) => {
    series.push(buildMarkLine(item.items, false, 0, 0, item.id, item.meta?.style, item.name));
  });

  series.push(buildGanttChart(gantt, 0, label, h, config));

  return series;
}

export function saveAsImage(chartInstance: ECharts): void {
  const dataURL = chartInstance.getDataURL({
    pixelRatio: 1,
    backgroundColor: '#fff',
  });

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `just-sofia-${moment().format('YYYY-MM-DD')}.png`;
  link.click();
}
