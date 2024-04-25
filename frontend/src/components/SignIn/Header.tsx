
import { Box } from "@mantine/core"
import classes from './SignIn.module.css'
import { Text } from "@mantine/core"

export default function Header({content}: {content: string}) {
  return (
    <Box className={classes.header}>
      <Text
        size="35px" 
        fw={700}
        ta="center"
        
      >
        {content.charAt(0).toUpperCase() + content.slice(1)}</Text>
    </Box>
  )
}