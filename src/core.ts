import { Cases, CasesPerRegion, Entry, Error, isEntry, isError, Region } from './types';
import config from '../config';
import qs from 'qs';

import axios from 'axios';
import secrets from "../secrets";
axios.defaults.paramsSerializer = (params) => {
  return qs.stringify(params, { indices: false });
}

//region --- REGIONS ---
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
//endregion

//region --- CASES ---
export const getCasesByRegionId: (
  id: number,
  year?: number,
  month?: number,
  day?: number
) => Promise<Cases | Entry | Error> = async (id, year, month, day) => {
  let url = `${config.URL_API_DATA}/region/${id}/cases`;
  if (year) url += `/${year}`;
  if (month) url += `/${month}`;
  if (day) url += `/${day}`;

  try {
    const region = await axios.get<Entry | Cases>(url);
    return region.data;
  } catch (e) {
    console.error(e);
    return {
      error: e,
    };
  }
};
//endregion

//region --- LOCAL ELABORATIONS
export const getRanking: (
  n: number,
  ordering: 'asc' | 'desc'
) => Promise<CasesPerRegion[]> = async (n, ordering) => {
  const regions = await getRegions();

  let ranks: CasesPerRegion[] = [];
  if (!isError(regions)) {
    for (let i = 0; i < regions.length; i++) {
      const id = regions[i].id;
      const cases = await getCasesByRegionId(id, 2020, 11, 6);
      if (isEntry(cases)) {
        ranks.push({
          region: regions[i],
          cases: cases.total_positive,
        });
      }
    }
  }

  ranks = ranks.sort((a: CasesPerRegion, b: CasesPerRegion) => a.cases - b.cases);
  if (ordering === 'asc') return ranks.slice(0, n);
  else return ranks.reverse().slice(0, n);
};
//endregion

//region --- CHARTS ---
export const getPieChart: () => Promise<File | Error> = async () => {
  const regions = await getRegions();

  let regionsNames: string[] = [];
  let regionsCases: number[] = [];

  if (!isError(regions)) {
    let totalCases = 0;
    for (let i = 0; i < regions.length; i++) {
      regionsNames.push(regions[i].name);

      const cases = await getCasesByRegionId(regions[i].id, 2020, 11, 6);
      if (isEntry(cases)) {
        regionsCases.push(cases.total_positive);
        totalCases += cases.total_positive;
      }
    }

    try {
      const response = await axios.get<File>('https://chart.googleapis.com/chart', {
        responseType: 'arraybuffer',
        params: {
          cht: 'p3',
          chs: `600x250`,
          chtt: 'Covid Infections',
          chd: `t:${regionsCases
            .map((regionCases) => Math.trunc((regionCases / totalCases) * 100))
            .join(',')}`,
          chl: `${regionsNames.join('|')}`,
          chco: 'ef476f,ffd166,06d6a0,118ab2,073b4c',
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
    return regions;
  }
};

export const getLineChart: () => Promise<File | Error> = async () => {
  const region = await getRegionById(22);
  let casesPerDay: number[] = [];
  let dayLabels: string[] = [];

  if (!isError(region)) {
    for (let i = 0; i < 30; i++) {
      const cases = await getCasesByRegionId(region.id, 2020, 11, i);
      if (isEntry(cases)) {
        casesPerDay.push(cases.total_positive);
        dayLabels.push(`${i}`);
      }
    }

    try {
      const response = await axios.get<File>('https://chart.googleapis.com/chart', {
        responseType: 'arraybuffer',
        params: {
          cht: 'lc',
          chs: `600x250`,
          chtt: 'Covid Infections',
          chds: '0,10000',
          chd: `t:${casesPerDay.join(',')}`,
          chdl: `${region.name}`,
          chco: '118ab2',
          chl: `${dayLabels.join('|')}`,
          chxt: 'x,y',
          chxr: '1,0,10000',
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
    return region;
  }
};
//endregion

//region --- MAP ---
export const getMap: () => Promise<File | Error> = async () => {
  const regions = await getRegions();

  const entries: {
    lat: number,
    long: number,
    cases: number,
  }[] = [];

  if (!isError(regions)) {
    let maxCases = 0;
    for (let i = 0; i < regions.length; i++) {
      const entry = {
        lat: regions[i].lat,
        long: regions[i].long,
        cases: 0,
      }

      const cases = await getCasesByRegionId(regions[i].id, 2020, 11, 6);
      if (isEntry(cases)) {
        entry.cases = cases.total_positive;
        if(maxCases < cases.total_positive) {
          maxCases = cases.total_positive;
        }

        entries.push(entry);
      }
    }

    console.log({
      key: secrets.MAPQUEST_KEY,
      size: '300,370',
      center: '42,12.5',
      zoom: 5,
      shape: entries.map(entry => `border:ff0000ff|fill:ff000099|radius:${100 * entry.cases / maxCases}|${entry.lat},${entry.long}`)
    })

    try {
      const response = await axios.get<File>('https://www.mapquestapi.com/staticmap/v5/map', {
        responseType: 'arraybuffer',
        params: {
          key: secrets.MAPQUEST_KEY,
          size: '300,370',
          center: '42,12.5',
          zoom: 5,
          type: 'light',
          shape: entries.map(entry => `border:ff0000ff|fill:ff000099|radius:${50 * entry.cases / maxCases}|${entry.lat},${entry.long}`)
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
    return regions;
  }
};
//endregion
