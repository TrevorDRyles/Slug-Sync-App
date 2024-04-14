import { Box, Paper } from '@mantine/core'
import SignInForm from './forms/SignInForm'

/**
 * This import is to seperate css styles from one another
 * For example, if you create a class "wrapper" every single
 * thing in the entire single page application with "wrapper"
 * gets those styles applied.
 * 
 * This is essentially just adding a variable to the styles
 */
import classes from './SignIn.module.css'

export default function SignIn() {
  return (
    <Box className={classes.formWrapper}>
      <SignInForm /> 
    </Box>
  )
}