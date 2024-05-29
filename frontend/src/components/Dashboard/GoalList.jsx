
import { GoalCard } from "../Goal/GoalCard"
import {Text } from "@mantine/core"

import classes from './Dashboard.module.css'
import React from "react";
import { RefetchContext } from "../../contexts/Refetch";

const fetchIncompletedGoals = (setIncomplete) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item)
  const bearerToken = user ? user.token: '';
  fetch(`http://localhost:3010/v0/goal/incompleted`, {
    method: 'GET',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json()
    })
    .then((json) => {
      const updatedJson = json.map(item => {
        return {...item, completed: false}
      })
      setIncomplete(updatedJson);
    })
    .catch((err) => {
      console.error(err)
    })
}

const fetchCompletedGoals = (setComplete) => {
  const item = localStorage.getItem('user')
  const user = JSON.parse(item)
  const bearerToken = user ? user.token : '';
  fetch(`http://localhost:3010/v0/goal/completed`, {
    method: 'GET',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json()
    })
    .then((json) => {
      const updatedJson = json.map(item => {
        return {...item, completed: true}
      })
      setComplete(updatedJson)
    })
    .catch(err => {
      console.error(err)
    })
}

export function GoalList() {

  const [complete, setComplete] = React.useState([])
  const [incomplete, setIncomplete] = React.useState([])
  const {refetch, setRefetch} = React.useContext(RefetchContext)

  React.useEffect(() => {
    fetchCompletedGoals(setComplete)
    fetchIncompletedGoals(setIncomplete)
    setRefetch(false)
  }, [refetch, setRefetch])

  const completedGoals = complete.map((goal) => (
    <div key={goal.id} className={classes.goalWrapper}>
      <GoalCard goalData={goal} location={'dashboard'} />
    </div>
  ))
  const incompletedGoals = incomplete.map((goal) => (
    <div key={goal.id} className={classes.goalWrapper}>
      <GoalCard goalData={goal} location={'dashboard'} />
    </div>
  ))
  return (
    <>
      <div>
        <div className={classes.title}>
          <Text
            size="xl"
            fw={900}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 321 }}
          >
            Incomplete
          </Text>
        </div>
        <div className={classes.ListWrapper}>
          {incompletedGoals}
        </div>
      </div>

      <div>
        <div className={classes.title}>
        <Text
          size="xl"
          fw={900}
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 321 }}
        >
          Complete
        </Text>
        </div>
          <div className={classes.ListWrapper}>
            {completedGoals}
          </div>
      </div>
    </>
  )
}
