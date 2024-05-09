import { Text } from "@mantine/core"
import classes from './Dashboard.module.css'
import { GoalList } from "./GoalList"
import { UnauthorizedPage } from "./UnauthorizedPage"
import * as React from 'react'
import {LoginContext} from '../../contexts/Login'

export function Dashboard() {
  const {accessToken} = React.useContext(LoginContext)
  return (
    <div className={classes.wrapper}>
      {accessToken ? (
        <GoalList />
      ) : (
        <UnauthorizedPage />
      )}
    </div>
  )
}