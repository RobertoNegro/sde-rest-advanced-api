/*********
 * Type definitions
 *   TypeScript interfaces and types should be defined here!
 */

export interface Region {
  id: number;
  name: string;
  lat: number;
  long: number;
}

export interface Entry {
  hospitalized_with_symptoms: number;
  intensive_care: number;
  total_hospitalized: number;
  home_isolation: number;
  total_positive: number;
  total_positive_variation: number;
  new_positives: number;
  resigned_cured: number;
  deceased: number;
  cases_from_suspected_diagnostic: number;
  cases_from_screening: number;
  total_cases: number;
  tampons: number;
  cases_tested: number;
}

export interface Cases {
  [id: number]: {
    [year: number]: {
      [month: number]: {
        [day: number]: Entry;
      };
    };
  };
}
