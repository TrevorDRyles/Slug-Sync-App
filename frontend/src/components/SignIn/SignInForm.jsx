import { upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Center} from '@mantine/core';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Anchor,
  Stack,
} from '@mantine/core';
import {useNavigate} from "react-router-dom";
import PropTypes from "prop-types";
import {LoginContext} from '../../contexts/Login'
import * as React from 'react'

const handleSubmit = (data, type, toggle, setAccessToken, history, setUser) => {
  if (type === 'register') {
    fetch(`http://localhost:3010/v0/signup`, {
      method: 'post',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
        })
        .then(() => {
          alert(`${upperFirst(type)} successful, please log in`)
          toggle()
        })
        .catch((err) => {
          alert('Error signing up, please try again')
        })
  }
  // referenced from cse 186 code trevor ryles
  else if (type === 'login') {
    fetch('http://localhost:3010/v0/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
          return res.json();
        })
        .then((json) => {
          setAccessToken(json.token)
          setUser(json)
          localStorage.setItem('user', JSON.stringify(json));
          history('/');
        })
        .catch((err) => {
          console.error(err);
          alert('Error signing in, please try again')
        });
  }
}

export default function SignInForm({type, toggle, ...props}) {
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const {setAccessToken, setUser} = React.useContext(LoginContext);
  const history = useNavigate();

  return (
    <Paper radius="md" p="xl" withBorder {...props} style={{minWidth: '500px'}}>
      <Center>
        <Text size="lg" fw={500} aria-label={'welcome'} id={'welcome'}>
          Welcome to SlugSync
        </Text>
      </Center>

      <Divider labelPosition="center" my="lg" />


      <form onSubmit={form.onSubmit((data) => {handleSubmit(data, type, toggle, setAccessToken, history, setUser)})}>
        <Stack>
          {type === 'register' && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius="md"
              id='name'
              aria-label='Name Input'
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@mantine.dev"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
            aria-label="Email Input"
            id='email'
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius="md"
            aria-label="Password Input"
            id='password'
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs" aria-label='Switch Signin'>
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl" aria-label="Submit Signin Button">
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

SignInForm.propTypes = {
  type: PropTypes.oneOf(['login', 'register']).isRequired,
  toggle: PropTypes.func.isRequired,
};
