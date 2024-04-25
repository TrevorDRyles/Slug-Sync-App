import React from 'react';
import { Paper } from '@mantine/core';
import classes from './MainContent.module.css';

function MainContent() {
  return (
    <div className={classes.container}>
      <Paper className={classes.content}>
        <h2>Main Content</h2>
        <p>Main content goes here...</p>
      </Paper>
    </div>
  );
}

export default MainContent;
