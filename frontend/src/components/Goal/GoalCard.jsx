import { Paper,Text, Divider, Button } from "@mantine/core"
import styles from './Goal.module.css';
import {Check} from 'react-feather'
import PropTypes from 'prop-types';
import * as React from 'react'
import { RefetchContext } from "../../contexts/Refetch";
import { IconFlame } from "@tabler/icons-react";

const completeGoal = (goalId, setRefetch) => {
  const item = localStorage.getItem('user')
  const user = JSON.parse(item)
  const bearerToken = user ? user.token : '';
  fetch(`http://localhost:3010/v0/complete/${goalId}`, {
    method: 'PUT',
    headers: new Headers({
      'Authorization': ` Bearer ${bearerToken}`
    })
  })
    .then(res => {
      if (!res.ok) {
        throw res
      }
      return res.json()
    })
    .then(() => {
      setRefetch(true)
    })
    .catch(err => {
      console.error(err)
    })
}

export function GoalCard({goalData}) {
  const {setRefetch} = React.useContext(RefetchContext)
  return(
    <div className={styles.goalPaper}>
      <Paper>
        <Text aria-label={'goal-title-' + goalData.title} className={styles.goalText}>{goalData.title}</Text>
        <Divider my="sm" />
        <Text>{goalData.description}</Text>
        <Text style={{ color: 'grey' }}>Recurring every {goalData.recurrence}</Text>
        <Divider my="sm" />
        <div className={styles.goalBottom}>
          {goalData.completed ? (
            <Check aria-label="Goal completed"/>
            ) : (
            <Button onClick={() => completeGoal(goalData.id, setRefetch)} aria-label="Goal not completed">
              Complete for today!
            </Button>
            )
          }
          <div className={styles.streakCount}>
            <IconFlame />
            <Text>{goalData.streak}</Text>
          </div>
        </div>
      </Paper>
    </div>
  )
}

GoalCard.propTypes = {
  goalData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    recurrence: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    streak: PropTypes.number.isRequired,
  }).isRequired,
};
