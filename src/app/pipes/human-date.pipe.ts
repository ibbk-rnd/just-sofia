import { Pipe, PipeTransform } from '@angular/core';
import { humanDate } from '../services/utils';
import moment from 'moment';

@Pipe({
  name: 'humanDate',
})
export class HumanDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    return humanDate(value);
  }
}

@Pipe({
  name: 'salary',
})
export class SalaryPipe implements PipeTransform {
  transform(value: string): number {
    const startDate = moment(value);
    const endDate = moment(new Date().getTime());

    return endDate.diff(startDate, 'months');
  }
}

@Pipe({
  name: 'salaryDays',
})
export class SalaryFromDaysPipe implements PipeTransform {
  transform(value: string): string {
    // Create a duration object from the days
    const duration = moment.duration(value, 'days');
    const fullMonths = Math.floor(duration.asMonths());
    // Calculate the number of months
    const months = duration.asMonths();

    return fullMonths.toString();
  }
}

@Pipe({
  name: 'salaryMonths',
})
export class SalaryFromMonthsPipe implements PipeTransform {
  transform(value: string): string {
    // Create a duration object from the days
    const duration = moment.duration(value, 'month');
    const fullMonths = Math.floor(duration.asMonths());
    // Calculate the number of months
    const months = duration.asMonths();

    return fullMonths.toString();
  }
}

@Pipe({
  name: 'dateDiff',
})
export class HumanDateDiff implements PipeTransform {
  transform(value: string, full: boolean = false): string {
    const startTimestamp = value;
    const endTimestamp = new Date().getTime();
    let startDate;
    let endDate;

    if (moment(startTimestamp) < moment(endTimestamp)) {
      startDate = moment(startTimestamp);
      endDate = moment(endTimestamp);
    } else {
      startDate = moment(endTimestamp);
      endDate = moment(startTimestamp);
    }

    const years = endDate.diff(startDate, 'years');
    startDate.add(years, 'years');

    const months = endDate.diff(startDate, 'months');
    startDate.add(months, 'months');

    const days = endDate.diff(startDate, 'days');

    if (full) {
      const parts = [];

      if (years > 0) {
        parts.push(`${years} ${years !== 1 ? 'години' : 'година'}`);
      }

      if (months > 0) {
        parts.push(`${months} ${months !== 1 ? 'месеца' : 'месец'}`);
      }

      if (days > 0) {
        parts.push(`${days} ${days !== 1 ? 'дни' : 'ден'}`);
      }

      return parts.join(', ');
    }

    if (endDate.diff(moment(startTimestamp), 'days') < 60) {
      return `${days} ${days !== 1 ? 'дни' : 'ден'}`;
    }

    if (endDate.diff(moment(startTimestamp), 'days') > 365) {
      return `${years} ${years !== 1 ? 'години' : 'година'}`;
    }

    return `${months} ${months !== 1 ? 'месеца' : 'месец'}`;
  }
}
