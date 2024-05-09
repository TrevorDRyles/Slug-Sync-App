import { Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import classes from './UnauthorizedPage.module.css';
import * as React from 'react'
import {useNavigate} from "react-router-dom";

export function UnauthorizedPage() {
  const history = useNavigate()
  return (
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            A <span className={classes.highlight}>modern</span> Goal <br /> tracking website
          </Title>
          <Text c="dimmed" mt="md">
            Join a community to gain access to like minded individuals striving to attain similar goals to your own!
          </Text>

          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={20} radius="xl">
                <IconCheck style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Create a goal</b> – keep yourself accountable by tracking your own goals
            </List.Item>
            <List.Item>
              <b>Search / Discover new goals</b> – join others in participating in a new healthy lifestyle
            </List.Item>
            <List.Item>
              <b>Communicate</b> – join a community to complete goals with others like you!
            </List.Item>
          </List>

          <Group mt={30}>
            <Button radius="xl" size="md" className={classes.control} onClick={() => history('/login')}>
              Login / Sign Up!
            </Button>
          </Group>
        </div>
        <Image src="https://raw.githubusercontent.com/mantinedev/ui.mantine.dev/8be56fdda5b7697f7448187f1c4750a8514af16a/lib/HeroBullets/image.svg" className={classes.image} />
      </div>
    </Container>
  );
}