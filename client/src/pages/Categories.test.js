import { beforeEach } from 'node:test';
import Categories from './Categories';
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor } from "@testing-library/react";
import axios from 'axios';
import React from "react";

jest.mock('../hooks/useCategory', () => jest.fn(() => []));