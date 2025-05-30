import moment from 'moment';
import { salariesFromRange } from '../utils';

export function bigTimeChart(series: any, yAxisGantt: any) {
  const fromYear = 1990;
  const toYear = moment().add('4', 'years');
  const years = [];
  const min = `${fromYear}-01-01`;
  const max = toYear.format('YYYY-MM-DD');

  for (let year = fromYear; year <= parseInt(toYear.format('YYYY')); year++) {
    years.push(year.toString());
  }

  return {
    tooltip: {
      axisPointer: {
        type: 'cross',
      },
      textStyle: {
        fontSize: 16,
      },
    },
    grid: [
      {
        top: '0%',
        bottom: '5%',
        right: '0%',
        left: '35%',
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'weakFilter',
      },
    ],
    xAxis: [
      {
        show: true,
        type: 'time',
        splitLine: {
          show: true,
        },
        axisTick: {
          show: false,
          alignWithLabel: false,
          customValues: years,
        },
        axisLabel: {
          show: true,
          interval: 0,
          customValues: years,
          formatter: function (value: any) {
            return moment.unix(value / 1000).format('YY');
          },
        },
        gridIndex: 0,
        min: min,
        max: max,
      },
    ],
    yAxis: [
      {
        gridIndex: 0,
        data: yAxisGantt,
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: true },
        axisLabel: {
          fontSize: 15,
        },
      },
    ],
    animation: false,
    series: series,
    textStyle: {
      fontFamily: 'Sofia Sans',
      fontSize: 15,
    },
  };
}

export function timeInChart(series: any, parties: any) {
  return {
    tooltip: {
      formatter: function (params: any) {
        const fill = params.color;
        const salaries = params.data.content.salaries;

        return `
          <div><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${fill};"></span>${params.data.content.title}</div>
          <div>${params.data.content.party}</div>
          <div>приблизително ${params.data.content.time}</div>
          <div><div class="mt-1" style="font-size: 1.05em">получени приблизително <span class="fw-bold text-primary">${salaries}</span> заплати от данъкоплатците за периода</div></div>
        `;
      },
    },
    legend: {},
    grid: {
      left: 0,
      right: 0,
      bottom: '4%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'години',
      nameLocation: 'middle',
      interval: 1,
      nameGap: 25,
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: parties,
      axisLabel: {
        fontSize: 15,
      },
    },
    textStyle: {
      fontFamily: 'Sofia Sans',
      fontSize: 15,
    },
    series: series,
  };
}
