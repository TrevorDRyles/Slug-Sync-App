import { Divider } from '@mantine/core';
import classes from './SignIn.module.css';

export function Footer() {
  return (
    <div className={classes.footer}>
      <Divider />
      <div className={classes.inner}>
        <span >{'Copyright © SlugSync 2024.'}</span>
      </div>
    </div>
  );
}