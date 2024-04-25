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
} from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
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

const headerItems = [
  {
    icon: IconPencilPlus,
    title: 'Create Goal',
    description: 'Create a goal to track your progress!',
    link: '/login',
  },
  {
    icon: IconZoomScan,
    title: 'View Goals',
    description: 'View your goals',
    link: '/login',
  },
];

export default function Header({ toggleSidebar}) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const links = headerItems.map((item) => (
    <Link to={item.link} key={item.title} className={classes.linkStyle}>
      <UnstyledButton className={classes.subLink} key={item.title}>
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
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">


          <Burger aria-label="Burger1" style={{marginRight: "146px"}} opened={drawerOpened} onClick={toggleSidebar}/>

          <Group h="100%" gap={0} visibleFrom="sm">
            <a href="/login" className={classes.link}>
              Home
            </a>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
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

                {/* <div className={classes.dropdownFooter}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} fz="sm">
                        Get started
                      </Text>
                      <Text size="xs" c="dimmed">
                        Their food sources have decreased, and their numbers
                      </Text>
                    </div>
                    <Button variant="default">Get started</Button>
                  </Group>
                </div> */}
              </HoverCard.Dropdown>
            </HoverCard>
            <a href="/login" className={classes.link}>
              Search
            </a>
          </Group>

          <Group visibleFrom="sm">
            <Button variant="default" onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/login")}>Sign up</Button>
          </Group>

        </Group>
      </header>


      {/* This "drawer" is leftover from the starter template, where on small screen the header is hidden and all items within moved to drawer
          Do we need this? it's for small screen only. I'm leaving the code here in case anyone wants to do something with it, but right now
          This code is not doing anything since I disabled the burger that brought it out and replaced it with the current Burger -Arnav*/}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <a href="#" className={classes.link}>
            Home
          </a>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
              <IconChevronDown
                style={{ width: rem(16), height: rem(16) }}
                color={theme.colors.blue[6]}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          {/* <a href="#" className={classes.link}>
            Learn
          </a>
          <a href="#" className={classes.link}>
            Academy
          </a> */}

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
};
