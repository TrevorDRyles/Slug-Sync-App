import React from 'react';
import { Paper } from '@mantine/core';
import classes from './MainContent.module.css';
import styles from './Goal/Goal.module.css';

function MainContent() {
  return (
    <div className={styles.container}>
      <div className={classes.content}>
      <Paper>
        <h2>Slug Sync</h2>
        <p>Slug Sync content goes here...</p>
      </Paper>
      </div>
    </div>
  );
}

export default MainContent;
