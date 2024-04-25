import { it, } from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import { render } from "@/__tests__/render";
import SignIn from '@/components/SignIn/SignIn'

it('Renders all components', async() => {
  render(<SignIn />)
  expect(screen.getAllByText('Login')).toBeDefined()
  expect(screen.getByText('Welcome to SlugSync')).toBeDefined()
})

it('Switches between register and login', async() => {
  render(<SignIn />)
  expect(screen.getAllByText('Login')).toBeDefined()
  fireEvent.click(screen.getByText("Don't have an account? Register"));
  expect(screen.getAllByText('Register')).toBeDefined()
  fireEvent.click(screen.getByText('Already have an account? Login'))
  expect(screen.getAllByText('Login')).toBeDefined()
})