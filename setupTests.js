import dotenv from 'dotenv';
import "@testing-library/jest-dom/extend-expect";
dotenv.config({path: './.env.local'});
jest.setTimeout(30000);
