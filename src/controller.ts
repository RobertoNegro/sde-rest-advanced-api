/*********
 * Main controller
 *   Here you can define all the processing logics of your endpoints.
 *   In a huge project, you should have multiple controllers, divided
 *   by the domain of the operation.
 */

import { Request, Response } from 'express';

import { Cases, isError } from './types';
import { getCasesByRegionId, getLineChart, getMap, getPieChart, getRanking, getRegionById, getRegions } from './core';

export const index = (req: Request, res: Response) => {
  // If in the URL (GET request) e.g. localhost:8080/?name=pippo
  const name = req.query['name'];

  // If in body of the request (as json or form-data)
  // const name = req.body['name'];

  // If in the URL as a parameter e.g. localhost:8080/pippo/ and route defined as '/:name'
  // const name = req.params['name'];

  const responseObj = {
    text: `Hello ${name}`,
  };
  res.send(responseObj);
};

export const regions = async (req: Request, res: Response) => {
  res.send(await getRegions());
};

export const regionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id']);
    res.send(await getRegionById(id));
  } catch (err) {
    res.status(400);
    res.send({ error: 'Invalid ID format!' });
  }
};

export const casesByRegionId = async (req: Request, res: Response) => {
  let id = null;
  try {
    id = parseInt(req.params['id']);
  } catch (err) {
    res.status(400);
    res.send({ error: 'Invalid ID format!' });
  }
  if (id != null) {
    let year;
    let month;
    let day;
    try {
      year = parseInt(req.params['year']);
    } catch (e) {}
    try {
      month = parseInt(req.params['month']);
    } catch (e) {}
    try {
      day = parseInt(req.params['day']);
    } catch (e) {}
    res.send(await getCasesByRegionId(id, year, month, day));
  }
};

export const ranking = async (req: Request, res: Response) => {
  const n = typeof req.query['n'] === 'string' ? parseInt(req.query['n']) : 5;
  const ord = req.query['ord'] === 'desc' || req.query['ord'] === 'asc' ? req.query['ord'] : 'desc';

  res.send(await getRanking(n, ord));
};

export const pieChart = async (req: Request, res: Response) => {
  const chart = await getPieChart();
  if (isError(chart)) {
    res.send(chart);
  } else {
    res.contentType('image/png');
    res.send(chart);
  }
};


export const lineChart = async (req: Request, res: Response) => {
  const chart = await getLineChart();
  if (isError(chart)) {
    res.send(chart);
  } else {
    res.contentType('image/png');
    res.send(chart);
  }
};

export const map = async (req: Request, res: Response) => {
  const map = await getMap();
  if (isError(map)) {
    res.send(map);
  } else {
    res.contentType('image/png');
    res.send(map);
  }
};

export const generateDatabase = async (req: Request, res: Response) => {
  const result: Cases = {
    '13': {
      '2020': {
        '10': {
          '28': {
            hospitalized_with_symptoms: 306,
            intensive_care: 26,
            total_hospitalized: 332,
            home_isolation: 4697,
            total_positive: 5029,
            total_positive_variation: 420,
            new_positives: 434,
            resigned_cured: 3630,
            deceased: 534,
            cases_from_suspected_diagnostic: 6889,
            cases_from_screening: 2304,
            total_cases: 9193,
            tampons: 276681,
            cases_tested: 172659,
          },
        },
      },
    },
  };

  for (let i = 1; i <= 22; i++) {
    result[i] = {
      '2020': {
        '9': {},
        '10': {},
        '11': {},
        '12': {},
      },
    };

    for (let j = 9; j <= 12; j++) {
      for (let k = 1; k <= 30; k++) {
        result[i][2020][j][k] = {
          hospitalized_with_symptoms: getRandomArbitrary(100, 500),
          intensive_care: getRandomArbitrary(10, 100),
          total_hospitalized: getRandomArbitrary(100, 500),
          home_isolation: getRandomArbitrary(2000, 10000),
          total_positive: getRandomArbitrary(2000, 10000),
          total_positive_variation: getRandomArbitrary(100, 500),
          new_positives: getRandomArbitrary(100, 500),
          resigned_cured: getRandomArbitrary(2000, 10000),
          deceased: getRandomArbitrary(1000, 5000),
          cases_from_suspected_diagnostic: getRandomArbitrary(2000, 10000),
          cases_from_screening: getRandomArbitrary(1000, 5000),
          total_cases: getRandomArbitrary(5000, 20000),
          tampons: getRandomArbitrary(200000, 1000000),
          cases_tested: getRandomArbitrary(200000, 1000000),
        };
      }
    }
  }

  res.send(result);
};

const getRandomArbitrary = (min: number, max: number) => {
  return Math.trunc(Math.random() * (max - min) + min);
};
