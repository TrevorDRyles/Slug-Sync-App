import { it, beforeAll, afterAll } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Home from "../components/Home.jsx";
import {BrowserRouter, useNavigate} from "react-router-dom";
import { render } from "./render";
import Sidebar from '../components/Sidebar.jsx';

const URL = 'http://localhost:3010/v0/goal';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Loads home', async () => {
    render(<BrowserRouter><Home/></BrowserRouter>);

    screen.getByText('Goals', {exact: false});
    fireEvent.click(screen.getByText('Goals', {exact: false}));

    screen.getByText('Home', {exact: false});
    fireEvent.click(screen.getByText('Home', {exact: false}));

    // screen.getByText('Search', {exact: false});
    // fireEvent.click(screen.getByText('Search', {exact: false}));

    screen.getByText('Log in', {exact: false});
    fireEvent.click(screen.getByText('Log in', {exact: false}));

    screen.getByText('Sign up', {exact: false});
    fireEvent.click(screen.getByText('Sign up', {exact: false}));
    screen.getAllByText('Slug Sync', {exact: false});

});

it('Loads home and sidebar', async () => {
    render(<BrowserRouter><Home/></BrowserRouter>);

    fireEvent.click(screen.getByLabelText('Burger1'));

    screen.getByLabelText('HomeIcon1');

    screen.getByLabelText('UserIcon1');

    screen.getByLabelText('SettingsIcon1');

    screen.getByLabelText('LogoutIcon');
});
