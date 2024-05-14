import { Paper,Text, Divider, Button } from "@mantine/core"
import styles from './Goal.module.css';
import {Check} from 'react-feather'
import PropTypes from 'prop-types';

export function GoalCard({goalData}) {
  return(
    <div className={styles.goalPaper}>
      <Paper style = {{backgroundcolor: 'lightgrey'}}>
        <Text aria-label={'goal-title-' + goalData.title} className={styles.goalText}>{goalData.title}</Text>
        <Divider my="sm" />
        <Text>{goalData.description}</Text>
        {goalData.recurrence > 1 ? (
          <Text style={{ color: 'grey' }}>Recurring every {goalData.recurrence} days</Text>
        ) : (
          <Text style={{ color: 'grey' }}>Recurring every day</Text>
        )}
        <Divider my="sm" />
        {goalData.completed ? (
          <Check />
          ) : (
          <Button>
            Complete for today!
          </Button>
          )
        }
      </Paper>
    </div>
  )
}

GoalCard.propTypes = {
  goalData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    recurrence: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
};
