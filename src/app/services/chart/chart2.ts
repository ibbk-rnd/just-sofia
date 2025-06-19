import * as echarts from 'echarts/core';
import moment from 'moment';

export function peopeInTime(series: any, yAxisGantt: any) {
  return {
    tooltip: {},
    animation: false,
    grid: [
      {
        top: '2%',
        bottom: '8%',
        right: '2.5%',
        left: '14%',
      },
    ],
    xAxis: [
      {
        show: true,
        axisTick: {
          show: true,
          length: 10,
          lineStyle: {
            color: '#000',
            width: 2,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#ccc',
            type: 'dashed',
          },
        },
        type: 'time',
        min: '1990-01-01',
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'weakFilter',
      },
      {
        type: 'slider',
        yAxisIndex: 0,
        zoomLock: true,
        start: 0,
        end: 100,
        handleSize: 0,
        showDetail: false,
      },
    ],
    yAxis: [
      {
        data: yAxisGantt,
        axisTick: {
          show: true,
          length: 10,
          lineStyle: {
            color: '#000',
            width: 2,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#ccc',
            type: 'dashed',
          },
        },
        axisLabel: {
          formatter: function (value: any, index: any) {
            return value;
          },
        },
      },
    ],

    series: series,
  };
}

export function filterByDate(data: any, startDate: any, endDate: any): any {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const result = data.map((item: any) => {
    return {
      ...item,
      roles: item.roles.map((role: any) => {
        return {
          ...role,
          persons: role.persons.filter((person: any) => {
            const personStartDate = new Date(person.value[0]);
            const personEndDate = new Date(person.value[1] ? person.value[1] : moment().format('YYYY-MM-DD'));
            return personStartDate <= end && personEndDate >= start;
          }),
        };
      }),
    };
  });

  let d = function filterCommittees(committees: any) {
    return committees
      .map((committee: any) => {
        const filteredRoles = committee.roles.filter((role: any) => role.persons.length > 0);

        return {
          ...committee,
          roles: filteredRoles,
        };
      })
      .filter((committee: any) => committee.roles.length > 0);
  };

  return d(result);
}

export function buildY(data: any[]) {
  let y: any = [];
  let names: any = {};

  data.forEach((value) => {
    y.push({
      value: value.name,
      textStyle: {
        align: 'left',
        fontWeight: 'bolder',
        fontSize: 15,
        color: '#000',
        padding: [0, -600, 0, 20],
      },
    });

    value.roles.forEach((role: any) => {
      if (!names[role.name]) {
        names[role.name] = {};
      }

      y.push({
        value: role.name,
        textStyle: {
          align: 'left',
          fontWeight: 'bolder',
          fontSize: 13,
          color: 'purple',
          padding: [0, -600, 0, 20],
        },
      });

      role.persons.forEach((person: any) => {
        if (!names[role.name][person.name]) {
          names[role.name][person.name] = 1;

          y.push({
            value: person.name,
          });
        }
      });
    });
  });

  y.reverse();

  return y;
}

export function ganttCompile2(groups: any) {
  let names2: any = {};
  let max = 0;

  groups.forEach((group: any) => {
    max = max + 1;
    group.roles.forEach((role: any) => {
      max = max + 1;

      if (!names2[role.name]) {
        names2[role.name] = {};
      }

      role.persons.forEach((person: any) => {
        if (!names2[role.name][person.name]) {
          max = max + 1;
          names2[role.name][person.name] = max;
        }
      });
    });
  });

  const data: any[] = [];
  let i = 0;
  let names: any = {};

  groups.forEach((group: any) => {
    i = i + 1;

    group.roles.sort((a: any, b: any) => a.name.localeCompare(b.name));

    group.roles.forEach((role: any) => {
      i = i + 1;

      if (!names[role.name]) {
        names[role.name] = {};
      }

      role.persons.sort((a: any, b: any) => {
        const firstDateComparison = new Date(a.value[0]).getTime() - new Date(b.value[0]).getTime();
        if (firstDateComparison !== 0) {
          return firstDateComparison;
        }

        return new Date(a.value[1]).getTime() - new Date(b.value[1]).getTime();
      });

      role.persons.forEach((person: any) => {
        let index;

        if (!names[role.name][person.name]) {
          i = i + 1;
          names[role.name][person.name] = { index: max - i };
          index = max - i;
        } else {
          index = names[role.name][person.name].index;
        }

        let label = person.name
          .split(' ')
          .filter((_: any, index: any, data: string[]) => data.length < 3 ||index !== 1)
          .join(' ');

        if (person.comment) {
          label = label + ` /${person.comment}/`;
        }

        data.push({
          name: person.name,
          value: [index, person.value[0], person.value[1] ? person.value[1] : moment().format('YYYY-MM-DD'), label],
          itemStyle: {
            color: '#627fff',
          },
        });
      });
    });
  });

  return {
    type: 'custom',
    renderItem: function (params: any, api: any) {
      const categoryIndex = api.value(0);
      const start = api.coord([api.value(1), categoryIndex]);
      const end = api.coord([api.value(2), categoryIndex]);
      const height = api.size([0, 1])[1] * 1;
      const label = api.value(3);
      const labelWidth = echarts.format.getTextRect(label).width;
      const text = end[0] - start[0] > labelWidth + 10 && start[0] + end[0] - start[0] >= 180 ? label : '';

      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height: height,
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height,
        }
      );

      const rectText = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height: height,
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height,
        }
      );

      return (
        rectShape && {
          type: 'group',
          children: [
            {
              type: 'rect',
              transition: ['shape'],
              shape: rectShape,
              style: {
                ...api.style(),
                stroke: 'black',
                lineWidth: 0,
                opacity: 0.8,
              },
              emphasis: {
                style: {
                  opacity: 1,
                },
              },
            },
            {
              type: 'rect',
              ignore: !rectText,
              shape: rectText,
              style: api.style({
                text: text,
                textFill: '#FFF',
              }),
            },
          ],
        }
      );
    },
    itemStyle: {
      opacity: 0.8,
    },
    encode: {
      x: [1, 2],
      y: 0,
    },
    data: data,
  };
}
