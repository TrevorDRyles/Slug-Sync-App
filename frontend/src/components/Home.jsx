import React from 'react';
import { Container, Grid, MantineProvider } from '@mantine/core';
import Header from './Header';
import Sidebar from './Sidebar';
import { useDisclosure } from '@mantine/hooks';
import {Dashboard} from './Dashboard/Main'
import { Footer } from './SignIn/Footer';

import classes from './Home.module.css'


function Home() {

  const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);


  return (
    <div>
      <Header toggleSidebar={toggleSidebar}/>
      <Dashboard />
      <Sidebar sidebarOpened={sidebarOpened}/>
      <div className={classes.footer}>
        <Footer/>
      </div>
    </div>

  );
}

export default Home;
