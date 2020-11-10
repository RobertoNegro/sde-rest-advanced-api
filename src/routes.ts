/*********
 * Route definitions
 *   All the routes that you want to implement should be defined here!
 *   You should avoid to put code here: it's a better approach to call
 *   methods from the controllers in order to process the requests!
 *   In this way, here you can have a more organized way to check all
 *   your routes!
 *   In a huge project, you can define multiple routers in order to divide
 *   the endpoints in different files by the domain of their operation.
 */

import express from 'express';
import {
  hello,
  casesByRegionId,
  lineChart,
  map,
  pieChart,
  ranking,
  regionById,
  regions,
} from './controller';

const router = express.Router();

// Possible methods: .get, .post, .put, .patch, .delete

// To add URL parameters (Doable for any method! Not only for GET):
// router.get('/:parameter1/:parameter2', f);

router.get('/', hello);

router.get('/regions', regions);
router.get('/region/:id', regionById);
router.get('/region/:id/cases/:year/:month/:day', casesByRegionId);

router.get('/ranking', ranking);
router.get('/charts/pie', pieChart);
router.get('/charts/line', lineChart);
router.get('/map', map);

export default router;
