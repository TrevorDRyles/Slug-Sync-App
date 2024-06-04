import { it, beforeAll, afterAll, expect } from 'vitest';
import {fireEvent, waitFor, screen} from '@testing-library/react';
import { render } from "@/__tests__/render";
import { setupServer } from 'msw/node';
import SignInForm from '@/components/SignIn/SignInForm';
import userEvent from '@testing-library/user-event';
import {errorHandlers, handlers} from './Handlers'
import { LoginProvider } from '../../contexts/Login';
import { MemoryRouter } from 'react-router-dom';
import { HttpResponse, http } from 'msw';


const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderSignInForm = (loginType) => {
  return render(
    <LoginProvider>
      <MemoryRouter>
        <SignInForm type={loginType} />
      </MemoryRouter>
    </LoginProvider>
  )
}

it('Renders with proper Login information', async() => {
  renderSignInForm('login')
  expect(screen.getByText('Welcome to SlugSync')).toBeDefined()
  expect(screen.getByText('Email')).toBeDefined()
  expect(screen.getByText('Password')).toBeDefined()
  expect(screen.getByText("Don't have an account? Register")).toBeDefined()
  expect(screen.getByText('Login')).toBeDefined()
})

it('Renders with proper Register information', async() => {
  renderSignInForm('register')
  expect(screen.getByText('Name')).toBeDefined()
  expect(screen.getByText('Email')).toBeDefined()
  expect(screen.getByText('Password')).toBeDefined()
  expect(screen.getByText("Already have an account? Login")).toBeDefined()
  expect(screen.getByText('Register')).toBeDefined()
})

it('Rejects login with invalid email', async() => {
  renderSignInForm('login')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '123456')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test')
  fireEvent.click(screen.getByText('Login'))
  expect(screen.getByText('Invalid email')).toBeDefined()
})

it('Rejects login with invalid password', async() => {
  renderSignInForm('login')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '123')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  fireEvent.click(screen.getByText('Login'))
  expect(screen.getByText('Password should include at least 6 characters')).toBeDefined()
})

it('Rejects registration with invalid email', async() => {
  renderSignInForm('register')
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
  renderSignInForm('register')
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

  renderSignInForm('register')
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

it('Fails to Sign up the user', async() => {
  server.use(...errorHandlers)
  let alerted = false
  window.alert = () => {alerted = true}

  renderSignInForm('register')
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

it('Successfully Logs in the user', async() => {
  server.use(...handlers)
  let alerted = false
  window.alert = () => {alerted = true}

  renderSignInForm('login')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '12345678')
  fireEvent.click(screen.getByText('Login'))
  await waitFor(() => {
    expect(alerted).toBeFalsy()
  })
})

it('Fails to Log the user in', async() => {
  server.use(...errorHandlers)
  let alerted = false
  window.alert = () => {alerted = true}

  renderSignInForm('login')
  const emailInput = screen.getByLabelText('Email Input')
  await userEvent.type(emailInput, 'test@gmail.com')
  const paswdInput = screen.getByLabelText('Password Input')
  await userEvent.type(paswdInput, '12345678')
  fireEvent.click(screen.getByText('Login'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})
