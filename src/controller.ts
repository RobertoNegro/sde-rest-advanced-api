/*********
 * Main controller
 *   Here you can define all the processing logics of your endpoints.
 *   It's a good approach to keep in here only the elaboration of the inputs
 *   and outputs, with complex logics inside other functions to improve
 *   reusability and maintainability. In this case, we've defined the complex
 *   logics inside the core.ts file!
 *   In a huge project, you should have multiple controllers, divided
 *   by the domain of the operation.
 */

import { Request, Response } from 'express';

import { isError } from './types';
import {
  getCasesByRegionId,
  getLineChart,
  getMap,
  getPieChart,
  getRanking,
  getRegionById,
  getRegions,
} from './core';

// Example!
export const hello = (req: Request, res: Response) => {
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

//region --- REGIONS and CASES ---

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
    return;
  }

  let year;
  let month;
  let day;
  try {
    year = parseInt(req.params['year']);
  } catch (e) {
    res.status(400);
    res.send({ error: 'Invalid year format!' });
    return;
  }
  try {
    month = parseInt(req.params['month']);
  } catch (e) {
    res.status(400);
    res.send({ error: 'Invalid month format!' });
    return;
  }
  try {
    day = parseInt(req.params['day']);
  } catch (e) {
    res.status(400);
    res.send({ error: 'Invalid day format!' });
    return;
  }
  res.send(await getCasesByRegionId(id, year, month, day));
};

//endregion

//region --- LOCAL ELABORATIONS ---

export const ranking = async (req: Request, res: Response) => {
  const n = typeof req.query['n'] === 'string' ? parseInt(req.query['n']) : 5;
  const ord = req.query['ord'] === 'desc' || req.query['ord'] === 'asc' ? req.query['ord'] : 'desc';

  res.send(await getRanking(n, ord));
};

//endregion

//region --- CHARTS ---

export const pieChart = async (req: Request, res: Response) => {
  const chart = await getPieChart();
  if (!isError(chart)) {
    res.contentType('image/png');
  }
  res.send(chart);
};

export const lineChart = async (req: Request, res: Response) => {
  const chart = await getLineChart();
  if (!isError(chart)) {
    res.contentType('image/png');
  }
  res.send(chart);
};

//endregion

//region --- MAP ---

export const map = async (req: Request, res: Response) => {
  const map = await getMap();
  if (!isError(map)) {
    res.contentType('image/png');
  }
  res.send(map);
};

//endregion
