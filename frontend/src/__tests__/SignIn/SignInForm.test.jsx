import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { render } from "@/__tests__/render";
import { setupServer } from 'msw/node';
import SignInForm from '@/components/SignIn/SignInForm';
import userEvent from '@testing-library/user-event';
import {errorHandlers, handlers} from './Handlers'

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Renders with proper Login information', async() => {
  render(<SignInForm type={'login'}/>)
  expect(screen.getByText('Welcome to SlugSync')).toBeDefined()
  expect(screen.getByText('Email')).toBeDefined()
  expect(screen.getByText('Password')).toBeDefined()
  expect(screen.getByText("Don't have an account? Register")).toBeDefined()
  expect(screen.getByText('Login')).toBeDefined()
})

it('Renders with proper Register information', async() => {
  render(<SignInForm type={'register'}/>)
  expect(screen.getByText('Name')).toBeDefined()
  expect(screen.getByText('Email')).toBeDefined()
  expect(screen.getByText('Password')).toBeDefined()
  expect(screen.getByText("Already have an account? Login")).toBeDefined()
  expect(screen.getByText('Register')).toBeDefined()
})

it('Rejects login with invalid email', async() => {
  render(<SignInForm type={'login'}/>)
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '123456')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test')
  fireEvent.click(screen.getByText('Login'))
  expect(screen.getByText('Invalid email')).toBeDefined()
})

it('Rejects login with invalid password', async() => {
  render(<SignInForm type={'login'} />)
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '123')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  fireEvent.click(screen.getByText('Login'))
  expect(screen.getByText('Password should include at least 6 characters')).toBeDefined()
})

it('Rejects registration with invalid email', async() => {
  render(<SignInForm type={'register'}/>)
  const nameInput = screen.getByLabelText('Name Input')
  await userEvent.type(nameInput, 'Test')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '123456')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test')
  fireEvent.click(screen.getByText('Register'))
  expect(screen.getByText('Invalid email')).toBeDefined()
})

it('Rejects registration with invalid password', async() => {
  render(<SignInForm type={'register'}/>)
  const nameInput = screen.getByLabelText('Name Input')
  await userEvent.type(nameInput, 'Test')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '132')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  fireEvent.click(screen.getByText('Register'))
  expect(screen.getByText('Password should include at least 6 characters')).toBeDefined()
})

it('Successfully Signs up the user', async() => {
  server.use(...handlers)
  let alerted = false
  window.alert = () => {alerted = true}

  render(<SignInForm type={'register'} />)
  const nameInput = screen.getByLabelText('Name Input')
  await userEvent.type(nameInput, 'Test Name')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '12345678')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  fireEvent.click(screen.getByText('Register'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})

it('Invalid user login', async () => {
  server.use(...errorHandlers);
  let alerted = false;
  window.alert = () => {
    alerted = true;
  };

  render(<SignInForm toggle={vi.fn()} type={'login'} />);

  const paswdInput = screen.getByLabelText('Password Input');
  await userEvent.type(paswdInput, '12345678');
  const emailInput = screen.getByLabelText('Email Input');
  await userEvent.type(emailInput, 'test@gmail.com');
  fireEvent.click(screen.getByText('Login'));

  await waitFor(() => {
    expect(alerted).toBeTruthy();
  });
});

it('Test Valid User Login', async () => {
  server.use(...handlers);
  const toggle = vi.fn();

  render(<SignInForm toggle={toggle} type={'login'} />);

  const paswdInput = screen.getByLabelText('Password Input');
  await userEvent.type(paswdInput, 'huntertratar');
  const emailInput = screen.getByLabelText('Email Input');
  await userEvent.type(emailInput, 'hunter@ucsc.edu');
  fireEvent.click(screen.getByText('Login'));

  await waitFor(() => {
    const userToken = localStorage.getItem('user');
    expect(userToken).toBeTruthy();
  });
});

it('Fails to Sign up the user', async() => {
  server.use(...errorHandlers)
  let alerted = false
  window.alert = () => {alerted = true}

  render(<SignInForm type={'register'} />)
  const nameInput = screen.getByLabelText('Name Input')
  await userEvent.type(nameInput, 'Test Name')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '12345678')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  fireEvent.click(screen.getByText('Register'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})
