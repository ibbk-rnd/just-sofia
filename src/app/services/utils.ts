import moment from 'moment/moment';

export function humanDate(date?: string | number) {
  return moment(date).format('D MMMM YYYY г.');
}

export function salariesFromRange(from: string, to?: string) {
  const startDate = moment(from);
  const endDate = moment(to ? to : new Date().getTime());

  return endDate.diff(startDate, 'months');
}

export function salariesFromDays(days: string) {
  const duration = moment.duration(days, 'days');

  return Math.floor(duration.asMonths());
}

export function findDaysInCommission(commissions: any, commission: string, party: string) {
  let totalDays = 0;

  commissions
    .find((item: any) => {
      return item.name == commission;
    })
    .items.filter((item: any) => {
      return item.electedBy == party;
    })
    .forEach((interval: any) => {
      const dates = interval.value;
      if (dates.length === 2) {
        const startDate = moment(dates[0]);
        const endDate = moment(dates[1] === null ? moment().format('YYYY-MM-DD') : moment(dates[1]));
        totalDays += endDate.diff(startDate, 'days');
      }
    });

  return totalDays;
}

export function convertDaysToYearsMonthsDays(totalDays: any) {
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;

  const months = Math.floor(remainingDaysAfterYears / 30.44); // Average month length
  const days = Math.round(remainingDaysAfterYears % 30.44); // Remaining days

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

  // return {
  //   years: years,
  //   months: months,
  //   days: days
  // };
}

export function humanDateDiff(from: string | number, to: string | number, inDays = false): string {
  const startTimestamp = from;
  let endTimestamp = to;

  if (endTimestamp === null) {
    endTimestamp = new Date().getTime();
  }

  const startDate = moment(startTimestamp);
  const endDate = moment(endTimestamp);

  if (inDays) {
    return endDate.diff(startDate, 'days') + ' дни';
  }

  const years = endDate.diff(startDate, 'years');
  startDate.add(years, 'years');

  const months = endDate.diff(startDate, 'months');
  startDate.add(months, 'months');

  const days = endDate.diff(startDate, 'days');

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
