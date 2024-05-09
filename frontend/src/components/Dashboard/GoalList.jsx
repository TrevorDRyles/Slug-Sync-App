
import { GoalCard } from "../Goal/GoalCard"
import { Box, Divider, Flex, Text } from "@mantine/core"

import classes from './Dashboard.module.css'
import React from "react";

// const complete = [
//   {
//     id: 1,
//     title: "Goal 1",
//     "description": "This is a test goal wowsers 123",
//     "recurrence": 2,
//     "completed": true
//   },
//   {
//     id: 2,
//     title: "Goal 2",
//     "description": "Test goal 1",
//     "recurrence": 3,
//     "completed": true
//   },
//   {
//     id: 3,
//     title: "Walk a mile",
//     "description": "Test goal 1",
//     "recurrence": 7,
//     "completed": true
//   }
// ]

// const incomplete = [
//   {
//     id: 4,
//     title: "Do task for class",
//     "description": "Test goal 1",
//     "recurrence": 1
//   },
//   {
//     id: 5,
//     title: "Homework",
//     "description": "Test goal 1",
//     "recurrence": 4
//   },
// ]

const fetchGoals = (setComplete, completed) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item)
  const bearerToken = user ? user.accessToken: '';
  fetch(`http://localhost:3010/v0/goal?page=1`, {
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
        return {...item, completed: completed}
      })
      setComplete(updatedJson);
    })
    .catch((err) => {
      console.error(err)
    })
}

export function GoalList() {

  const [complete, setComplete] = React.useState([])
  const [incomplete, setIncomplete] = React.useState([])

  React.useEffect(() => {
    fetchGoals(setIncomplete, false)
    fetchGoals(setComplete, true)
  }, [])
  console.log(complete)

  const completedGoals = complete.map((goal) => (
    <div key={goal.id} className={classes.goalWrapper}>
      <GoalCard goalData={goal} />
    </div>
  ))
  const incompletedGoals = incomplete.map((goal) => (
    <div key={goal.id} className={classes.goalWrapper}>
      <GoalCard goalData={goal} />
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