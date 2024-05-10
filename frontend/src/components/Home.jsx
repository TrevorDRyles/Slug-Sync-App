import React from 'react';
import { Container, Grid, MantineProvider } from '@mantine/core';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useDisclosure } from '@mantine/hooks';

function Home() {

  let id;
  const user = localStorage.getItem('user')
  if (user) {
    id = JSON.parse(user).id
  }
  console.log(id)

  const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);

  return (
    <div>
      <Header toggleSidebar={toggleSidebar}/>
      <MainContent />
      <Sidebar sidebarOpened={sidebarOpened}/>
    </div>

  );
}

export default Home;
