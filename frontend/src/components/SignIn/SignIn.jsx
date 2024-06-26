import {Box} from '@mantine/core'
import SignInForm from './SignInForm'
import {Footer} from './Footer.jsx'
import Header from './Header.jsx';
import { useToggle } from '@mantine/hooks';

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

  const [type, toggle] = useToggle(['login', 'register']);


  return (
    <Box className={classes.wrapper}>
      <Header content={type} />
      <Box className={classes.formWrapper}>
        <SignInForm type={type} toggle={toggle}/>
      </Box>
      <Footer />
    </Box>
  )
}
