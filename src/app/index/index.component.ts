import { ChangeDetectorRef, Component, inject, OnInit, TemplateRef } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, CustomChart, LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import { ECharts } from 'echarts';
import { DataService } from '../services/data.service';
import { forkJoin } from 'rxjs';
import { buildSeries } from '../services/chart/utils';
import { CommonModule } from '@angular/common';
import { CanvasRenderer } from 'echarts/renderers';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { convertDaysToYearsMonthsDays, findDaysInCommission, humanDateDiff, salariesFromDays } from '../services/utils';
import { HumanDateDiff, HumanDatePipe, SalaryPipe } from '../pipes/human-date.pipe';
import { IconsModule } from '../icons.module';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { bigTimeChart, timeInChart } from '../services/chart/chart';
import moment from 'moment/moment';
import { buildY, filterByDate, ganttCompile2, peopeInTime } from '../services/chart/chart2';
import { animate, state, style, transition, trigger } from '@angular/animations';

echarts.use([
  BarChart,
  GridComponent,
  CanvasRenderer,
  LegendComponent,
  LineChart,
  CustomChart,
  ToolboxComponent,
  DataZoomComponent,
  TooltipComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TitleComponent,
]);

@Component({
  selector: 'app-index',
  imports: [CommonModule, NgxEchartsDirective, FormsModule, HumanDatePipe, IconsModule, RouterLink, HumanDateDiff, ReactiveFormsModule, SalaryPipe],
  templateUrl: './index.component.html',
  providers: [provideEchartsCore({ echarts })],
  animations: [
    trigger('accordionToggle', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: 1,
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden',
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class IndexComponent implements OnInit {
  public groups!: any;
  public chart!: any;
  public chart2!: any;
  public chart3!: any;
  public chartInstance!: ECharts;
  public chartInstance3!: ECharts;
  public content: any;
  public budget: any;
  public highlight: any = [];
  public mostSalaries: any;
  public toggleInfo = false;
  public data: any = {
    timeline: [],
    verticalLine: [],
    slujiteli: [],
    config: {},
    budget: [],
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  public activeCommissions: any = [];
  public upcomingElections: any = [];
  private items = 0;

  ngOnInit(): void {
    forkJoin([
      this.dataService.getData('budget.json'),
      this.dataService.getData('commissions.json'),
      this.dataService.getData('events.json'),
      this.dataService.getData('municipal-councilors.json'),
      this.dataService.getData('config.json'),
    ]).subscribe({
      next: ([budget, commissions, verticalLine, savetnici, config]) => {
        this.data.timeline = commissions;
        this.data.verticalLine = verticalLine;
        this.data.slujiteli = savetnici;
        this.data.config = config;
        this.data.budget = budget;
        this.chart3 = peopeInTime(ganttCompile2(savetnici), buildY(savetnici));
        this.budget = this.getActualBudget(budget);
        this.mostSalaries = this.calcMostSalaries(savetnici);
        this.activeCommissions = this.getActiveCommissions(commissions, '2023-10-29');
        this.upcomingElections = this.findUpcomingElections(verticalLine);

        this.highlight.push(this.findActiveCommission(commissions, 'Комисия по финанси и бюджет'));

        // console.log(convertDaysToYearsMonthsDays(findDaysInCommission(commissions, 'Комисия по финанси и бюджет', 'ГЕРБ')));
        // this.highlight.push(this.findActiveCommission(commissions, "Комисия по транспорт и пътна безопасност"));
        // this.highlight.push(this.findActiveCommission(commissions, "Комисия, съгласно Закона за противодействие на корупцията"));

        this.loadChart(commissions, config);
        this.cdr.detectChanges();
      },
      error: () => {},
      complete: () => {},
    });
  }

  getActualBudget(budget: any) {
    let result = budget.find((item: any) => {
      return (item.year = 2025);
    });

    result['amount'] = new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
    }).format(result.amount);

    return result;
  }

  findActiveCommission(commissions: any, find: string) {
    const commission = commissions.find((item: any) => {
      return item.name == find;
    });

    const person = commission.items.find((item: any) => {
      return item.value[1] == null;
    });

    return {
      commission: commission,
      person: person,
      days: convertDaysToYearsMonthsDays(findDaysInCommission(commissions, commission.name, person.electedBy)),
      electedBy: person.electedBy,
    };
  }

  calcMostSalaries(savetnici: any) {
    const persons: any = [];

    const s = savetnici[1];

    s['roles'].forEach((role: any) => {
      role.persons.forEach((person: any) => {
        if (!person.value[1]) {
          persons.push(person.name);
        }
      });
    });

    let result: any = {};

    s['roles'].forEach((role: any) => {
      role.persons.forEach((person: any) => {
        if (persons.includes(person.name)) {
          if (!result[person.name]) {
            result[person.name] = {
              salaries: 0,
            };
          }

          const startDate = moment(person.value[0]);
          const endDate = moment(person.value[1] ? person.value[1] : new Date().getTime());

          result[person.name]['salaries'] = result[person.name]['salaries'] + endDate.diff(startDate, 'months');

          if (!person.value[1]) {
            result[person.name]['party'] = role.name;
          }
        }
      });
    });

    return Object.entries(result)
      .map(([name, { salaries, party }]: any) => ({
        name,
        salaries,
        party,
      }))
      .sort((a, b) => {
        const cityComparison = a.party.localeCompare(b.party);

        if (cityComparison !== 0) {
          return cityComparison;
        }
        return b.salaries - a.salaries;
      });
  }

  findUpcomingElections(data: any): [] {
    return data.find((item: any) => item.id === 'upcoming-elections')['items'];
  }

  loadChart(gantt: any, config: any): void {
    const series = buildSeries(gantt, this.data.verticalLine, false, false, config);

    this.chart = bigTimeChart(
      series,
      gantt.map((group: any) => group.name)
    );

    let parties: any = [];
    let roles = this.data.timeline;

    roles.forEach((timeline: any) => {
      timeline.items.forEach((item: any) => {
        if (!parties.includes(item.electedBy)) {
          parties.push(item.electedBy);
        }
      });
    });

    let d: any = {};
    let categories: any = [];

    roles.forEach((role: any) => {
      categories.push(role.name);

      role.items.forEach((item: any) => {
        if (!d[role.name]) {
          d[role.name] = {};
        }

        if (!d[role.name][item.electedBy]) {
          d[role.name][item.electedBy] = 0;
        }

        const startDate: any = new Date(item.value[0]);
        const endDate: any = item.value[1] === null ? new Date() : new Date(item.value[1]);
        const diffInMs = endDate - startDate;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        // const diffInDays = 365;

        // console.log(diffInDays / 365)

        d[role.name][item.electedBy] += diffInDays;
        // d[role.name][item.electedBy] = 366;
      });
    });

    const ser: any = [];
    parties.forEach((party: any) => {
      let data: any = [];

      roles.forEach((role: any) => {
        if (d[role.name][party]) {
          data.push({
            content: {
              title: role.name,
              party: party,
              time: convertDaysToYearsMonthsDays(d[role.name][party]),
              salaries: salariesFromDays(d[role.name][party]),
            },
            value: d[role.name][party] / 365,
          });
        } else {
          data.push(null);
        }
      });

      ser.push({
        name: party,
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: function (value: any) {
            if (value.seriesName.length > 6) {
              return '';
            }

            return `${value.seriesName}`;
          },
        },
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          color: config['colors'][party] ? config['colors'][party] : '#000000',
        },
        data: data,
      });
    });

    this.chart2 = timeInChart(ser, categories);
  }

  onChartInit(chart: any): void {
    this.chartInstance = chart;
  }

  onChartInit4(chart: any): void {
    this.chartInstance3 = chart;

    setTimeout(() => {
      this.chartInstance3.dispatchAction({
        type: 'dataZoom',
        start: 5,
        end: 100,
      });
    }, 100);
  }

  getActiveCommissions(commissions: any, afterDate: string) {
    const active: any = [];

    commissions
      .filter((t: any) => t.type === 'commission')
      .forEach((commission: any) => {
        commission.items.forEach((item: any) => {
          const start = new Date(item.value[0]);
          const after = new Date(afterDate);

          if (start.getTime() >= after.getTime()) {
            active.push({
              institution: commission.name,
              meta: commission?.meta,
              person: item,
              daysInRole: this.findDaysInRole(item.name, commission.name, commissions),
            });
          }
        });
      });

    active.sort((a: any, b: any) => {
      if (a.person.electedBy < b.person.electedBy) {
        return -1;
      }
      if (a.person.electedBy > b.person.electedBy) {
        return 1;
      }
      return 0;
    });

    return active;
  }

  findDaysInRole(person: string, role: any, roles: any) {
    const targetRole = roles.find((item: any) => item.name === role);

    if (!targetRole) {
      return 0;
    }

    const par = targetRole.items.filter((item: any) => {
      return item.name === person;
    });

    let months = 0;

    par.forEach((item: any) => {
      const startDate = moment(item.value[0]);
      const endDate = moment(item.value[1] ? item.value[1] : new Date().getTime());
      months += endDate.diff(startDate, 'days');
    });

    return months;
  }

  private modalService = inject(NgbModal);

  openFullscreen(content: TemplateRef<any>) {
    this.modalService.open(content, { scrollable: true, size: 'xl' });
  }

  onChartClick(event: any): void {
    this.content = null;

    const itemSources = event.data.content?.sources ?? [];
    const name = event.name;

    this.content = event.data.content;
  }

  onChartClick2(event: any): void {
    this.content = event.data.content;
  }

  onClose(uid: string): void {
    this.content = null;
  }

  showNames = false;
  highlightResourceful = false;

  showPersonNames(party: boolean) {
    this.showNames = party;

    const options: any = this.chartInstance.getOption();
    options['series'] = buildSeries(this.data.timeline, this.data.verticalLine, this.showNames, this.highlightResourceful, this.data.config);
    this.chartInstance.setOption(options, true);
  }

  showPersonNames2() {
    this.highlightResourceful = !this.highlightResourceful;

    const options: any = this.chartInstance.getOption();
    options['series'] = buildSeries(this.data.timeline, this.data.verticalLine, this.showNames, this.highlightResourceful, this.data.config);
    this.chartInstance.setOption(options, true);
  }

  onDataZoom(params: any) {
    const axis: any = this.chartInstance3.getOption()['dataZoom'];
    const start = moment.unix(axis[0].startValue / 1000).format('YYYY-MM-DD');
    const end = moment.unix(axis[0].endValue / 1000).format('YYYY-MM-DD');
    const options: any = this.chartInstance3.getOption();
    const filtered: any = filterByDate(this.data.slujiteli, start, end);
    let series = [];

    series.push(ganttCompile2(this.data.slujiteli));
    options['series'] = [];
    options['series'].push(ganttCompile2(filtered));
    options['yAxis'][0]['data'] = buildY(this.data.slujiteli);

    const totalTasks = options['series'][0].data.length;
    const visibleRows = 42;
    let zoomEnd = (visibleRows / totalTasks) * 100;

    if (totalTasks < visibleRows) {
      {
        zoomEnd = 100;
      }
    }

    if (this.items !== totalTasks) {
      options['dataZoom'][1]['minSpan'] = zoomEnd;
      options['dataZoom'][1]['maxSpan'] = zoomEnd;
      options['dataZoom'][1]['start'] = 100;
      options['dataZoom'][1]['end'] = 100;
    }

    let er = [];
    er.push(ganttCompile2(filtered));

    let opt = options;
    opt['yAxis'][0]['data'] = buildY(filtered);
    opt['series'] = er;

    this.chartInstance3.setOption(opt, true);
    this.items = totalTasks;
  }

  protected readonly humanDateDiff = humanDateDiff;

  onToggleInfo() {
    this.toggleInfo = !this.toggleInfo;
  }
}
