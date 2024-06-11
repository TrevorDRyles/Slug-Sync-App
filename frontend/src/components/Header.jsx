/*
Sidebar/Navbar component
Built upon starter framework from mantine documentation
https://ui.mantine.dev/category/headers/
*/

//NOTE FOR CHANGING LINKS IN FUTURE: Ctrl+f "/login" to find all link stubs

import {
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  useMantineTheme,
  Avatar,
} from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import { IconBrandMantine } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import {
  IconNotification,
  IconCode,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCoin,
  IconChevronDown,
  IconSearch,
  IconPencilPlus,
  IconZoomScan,
  IconHeartRateMonitor,
} from '@tabler/icons-react';
import classes from './Header.module.css';
import PropTypes from "prop-types";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../contexts/Login';
import * as React from 'react'

const headerItems = [
  {
    icon: IconPencilPlus,
    title: 'Create Goal',
    description: 'Create a goal to track your progress!',
    link: '/createGoal',
    ariaLabel: 'Create Goal Button'
  },
  {
    icon: IconZoomScan,
    title: 'View Goals',
    description: 'View your goals',
    link: '/goals',
    ariaLabel: 'View Goal Button'
  },
];

export default function Header() {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const {accessToken, setAccessToken, user} = React.useContext(LoginContext);

  const logout = () => {
    localStorage.removeItem('user')
    setAccessToken('')
    navigate("/login")
  }

  const links = headerItems.map((item) => (
    <Link to={item.link} key={item.title} className={classes.linkStyle}>
      <UnstyledButton className={classes.subLink} key={item.title} aria-label={item.ariaLabel}>
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon style={{ width: rem(22), height: rem(22) }} color={theme.colors.blue[6]} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>
              {item.title}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </Link>
  ));

  return (
    <Box>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">

        <IconBrandMantine style={{marginRight: "146px"}}/>

          <Group h="100%" gap={0} visibleFrom="sm">
            <div
              aria-label={'Profile Photo'}
              onClick={() => navigate('/')}
              className={classes.link}
              style={{cursor: 'pointer'}}
            >
              Home
            </div>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5} aria-label='Goals dropdown'>
                      Goals
                    </Box>
                    <IconChevronDown
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.blue[6]}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text ta="center" fw={500}>Goals</Text>
                  {/* <Anchor href="#" fz="xs">
                    View all
                  </Anchor> */}
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>
            {/*<a className={classes.link}>*/}
            {/*  Search*/}
            {/*</a>*/}
          </Group>

          <Group visibleFrom="sm">
            {accessToken ? (
              <>
                <Avatar aria-label={'Avatar Profile Photo'} style={{cursor: 'pointer'}}
                        onClick={() => navigate('/profile/' + user.id)} src={user.img}/>
                <Text >Hello {user.name}! </Text>
                <Button id={'logout'} variant="default" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button aria-label={'Logout'} onClick={() => navigate("/login")}>Login / Sign up</Button>
              </>
            )}
          </Group>

        </Group>
      </header>
    </Box>
  );
}
