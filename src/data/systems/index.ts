import type { SystemScenario } from '../../types/system';
import { lmsSystem } from './lms';
import { studentManagementSystem } from './student_management';
import { hospitalSystem } from './hospital';
import { ecommerceSystem } from './ecommerce';
import { librarySystem } from './library';
import { supermarketSystem } from './supermarket';
import { hotelSystem } from './hotel';
import { restaurantSystem } from './restaurant';
import { airlineSystem } from './airline';
import { bankingSystem } from './banking';
import { payrollSystem } from './payroll';
import { inventorySystem } from './inventory';
import { movieTicketsSystem } from './movietickets';
import { socialMediaSystem } from './socialmedia';
import { rideSharingSystem } from './ridesharing';

export const systemsCatalog: SystemScenario[] = [
  lmsSystem,
  studentManagementSystem,
  hospitalSystem,
  ecommerceSystem,
  librarySystem,
  supermarketSystem,
  hotelSystem,
  restaurantSystem,
  airlineSystem,
  bankingSystem,
  payrollSystem,
  inventorySystem,
  movieTicketsSystem,
  socialMediaSystem,
  rideSharingSystem,
];

export const allSystems = systemsCatalog;

export {
  lmsSystem,
  studentManagementSystem,
  hospitalSystem,
  ecommerceSystem,
  librarySystem,
  supermarketSystem,
  hotelSystem,
  restaurantSystem,
  airlineSystem,
  bankingSystem,
  payrollSystem,
  inventorySystem,
  movieTicketsSystem,
  socialMediaSystem,
  rideSharingSystem,
};
