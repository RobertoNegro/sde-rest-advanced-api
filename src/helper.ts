/*********
 * Helper
 *   Here you can define all those functions that can be
 *   useful in several places but does not belong to any
 *   of the other files.
 */

import { Request } from 'express';

/**
 * Extract a specific parameter from the query-string
 * @param req The request (as given in the controller)
 * @param param The id of the parameter to be extracted
 * @return the value of the parameter if the parameter is
 * correct and available, false otherwise
 */
export const getNumberFromRequest: (req: Request, param: string) => number | false = (
  req,
  param
) => {
  let value = req.query[param];

  if (typeof value !== 'string') {
    return false;
  }

  try {
    return parseInt(value);
  } catch (e) {
    console.error(`Error extracting parameter ${param}:`, e);
    return false;
  }
};

/**
 * Extract id from the request query-string
 * @param req The request (as given in the controller)
 * @return the id if the parameter is correct and
 * available, false otherwise
 */
export const getIdFromRequest: (req: Request) => number | false = (req) => {
  return getNumberFromRequest(req, 'id');
};

/**
 * Extract day, month and year from the request query-string
 * @param req The request (as given in the controller)
 * @return an object containing day, month and year parameters
 * if the parameter for the day/month/year is not available,
 * the current day/month/year will be used
 */
export const getDateFromRequest: (
  req: Request
) => {
  day: number;
  month: number;
  year: number;
} = (req) => {
  let day = getNumberFromRequest(req, 'd');
  let month = getNumberFromRequest(req, 'm');
  let year = getNumberFromRequest(req, 'y');

  const currentDate = getCurrentDate();
  if (day === false) {
    day = currentDate.day;
  }
  if (month === false) {
    month = currentDate.month;
  }
  if (year === false) {
    year = currentDate.year;
  }

  return {
    day: day,
    month: month,
    year: year,
  };
};

/**
 * Returns the current day
 * @return an object containing day, month and years parameters
 * representing the current date (today)
 */
export const getCurrentDate: () => {
  day: number;
  month: number;
  year: number;
} = () => {
  const date = new Date();
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};
