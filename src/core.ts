/*********
 * Core functionalities
 *   All the processing logics are defined here. In this way, we leave in the
 *   controller all the input/output filtering and selection, and here we write
 *   the "raw" logics. In this way they're also re-usable! :)
 *   Obviously, in a real project, those functionalities should be divided as well.
 *   "Core" is not a fixed word for this type of file, sometimes
 *   people put those functions in a Utils file, sometimes in a Helper
 *   file, sometimes in a Services folder with different files for every service..
 *   It really depends on your project, style and personal preference :)
 */

import { CasesPerRegion, Entry, Error, isError, Region } from './types';
import config from '../config';
import qs from 'qs';

import axios from 'axios';
import secrets from '../secrets';
axios.defaults.paramsSerializer = (params) => {
  return qs.stringify(params, { indices: false });
};

//#region --- EXAMPLE ---

export const getHello: (name: string) => { text: string } = (name) => {
  return {
    text: `Hello ${name}`,
  };
};

//#endregion

//#region --- REGIONS and CASES ---

export const getRegions: () => Promise<Region[] | Error> = async () => {
  try {
    const regions = await axios.get<Region[]>(`${config.URL_API_DATA}/regions`);
    return regions.data;
  } catch (e) {
    console.error(e);
    return {
      error: e.toString(),
    };
  }
};

export const getRegionById: (id: number) => Promise<Region | Error> = async (id) => {
  try {
    const region = await axios.get<Region>(`${config.URL_API_DATA}/region/${id}`);
    return region.data;
  } catch (e) {
    console.error(e);
    return {
      error: e,
    };
  }
};

export const getCasesByRegionId: (
  id: number,
  year: number,
  month: number,
  day: number
) => Promise<Entry | Error> = async (id, year, month, day) => {
  try {
    const cases = await axios.get<Entry>(`${config.URL_API_DATA}/region/${id}/cases/${year}/${month}/${day}`);
    return cases.data;
  } catch (e) {
    console.error(e);
    return {
      error: e,
    };
  }
};

//#endregion

//#region --- LOCAL ELABORATIONS ---

export const getRanking: (
  n: number,
  ord: string,
  year: number,
  month: number,
  day: number
) => Promise<CasesPerRegion[]> = async (n, ord, year, month, day) => {
  const regions = await getRegions();

  let ranks: CasesPerRegion[] = [];
  if (!isError(regions)) {
    for (let i = 0; i < regions.length; i++) {
      const cases = await getCasesByRegionId(regions[i].id, year, month, day);
      if (!isError(cases)) {
        ranks.push({
          region: regions[i],
          cases: cases.total_positive,
        });
      }
    }
  }

  ranks = ranks.sort((a: CasesPerRegion, b: CasesPerRegion) => b.cases - a.cases);
  if (ord === 'asc') {
    ranks = ranks.reverse();
  }
  return ranks.slice(0, n);
};

//#endregion

//#region --- CHARTS ---

export const getBarChart: (
  year: number,
  month: number,
  day: number
) => Promise<File | Error> = async (year, month, day) => {
  const regions = await getRegions();

  if (!isError(regions)) {
    let labels = '';
    let data = '';
    let maxCases = 10000;

    // For each region, take the total number of positives and create the parameters query
    for (let i = 0; i < regions.length; i++) {
      const cases = await getCasesByRegionId(regions[i].id, year, month, day);
      if (!isError(cases)) {
        labels += regions[i].name.replace('P.A. ', '').slice(0, 4) + '.|';
        data += cases.total_positive + ',';
        if (cases.total_positive > maxCases) {
          maxCases = cases.total_positive;
        }
      }
    }

    // remove trailing comma and pipe
    if (labels.length > 0) {
      labels = labels.slice(0, -1);
    }
    if (data.length > 0) {
      data = data.slice(0, -1);
    }

    // Let's make the request to google chart API to create the chart
    try {
      const response = await axios.get<File>('https://chart.googleapis.com/chart', {
        responseType: 'arraybuffer', // Needed because the response is not a json but a binary file!
        params: {
          cht: 'bvg',
          chs: `700x250`,
          chtt: 'Covid Infections',
          chds: `0,${maxCases}`,
          chd: `t:${data}`,
          chco: '118ab2',
          chl: `${labels}`,
          chxt: 'x,y',
          chxr: `1,0,${maxCases}`,
        },
      });

      return response.data;
    } catch (e) {
      console.error(e);
      return {
        error: e,
      };
    }
  } else {
    return regions; // It's an error! :( We return it as is.
  }
};

export const getLineChart: (
  id: number,
  year: number,
  month: number,
) => Promise<File | Error> = async (id, year, month) => {
  const region = await getRegionById(id);

  if (!isError(region)) {
    let labels = '';
    let data = '';
    let maxCases = 10000;

    // Get cases for each day of the month
    for (let i = 1; i <= 31; i++) {
      const cases = await getCasesByRegionId(region.id, year, month, i);
      // If the day does not exists, it will be an error,
      // so even if we're trying to get 31th of February,
      // it will not be added to the labels and data!
      if (!isError(cases)) {
        labels += i + '|';
        data += cases.total_positive + ',';
        if (cases.total_positive > maxCases) {
          maxCases = cases.total_positive;
        }
      }
    }

    // remove trailing comma and pipe
    if (labels.length > 0) {
      labels = labels.slice(0, -1);
    }
    if (data.length > 0) {
      data = data.slice(0, -1);
    }

    // Let's make the request to google chart API to create the chart
    try {
      const response = await axios.get<File>('https://chart.googleapis.com/chart', {
        responseType: 'arraybuffer', // Needed because the response is not a json but a binary file!
        params: {
          cht: 'lc',
          chs: `600x250`,
          chtt: 'Covid Infections',
          chds: `0,${maxCases}`,
          chd: `t:${data}`,
          chdl: region.name,
          chco: '118ab2',
          chl: `${labels}`,
          chxt: 'x,y',
          chxr: `1,0,${maxCases}`,
        },
      });

      return response.data;
    } catch (e) {
      console.error(e);
      return {
        error: e,
      };
    }
  } else {
    return region; // It's an error! :( We return it as is.
  }
};

//#endregion
