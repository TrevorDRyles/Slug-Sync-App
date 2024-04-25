import React, { useState, useEffect } from 'react';
import { Paper, Text, Divider, Button} from '@mantine/core';
import { useParams } from 'react-router-dom';
import styles from './Goal.module.css';
import Header from "@/components/Header.jsx";

const ViewGoal = () => {
  const { id } = useParams();
  const [goalData, setGoalData] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3010/v0/goal/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${bearerToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      })
      .then((json) => {
        setGoalData(json);
      })
      .catch((err) => {
        console.log('Error getting goal: ' + err);
      });

    // Fetch members data here
    /*
    fetch('http://localhost:3010/v0/goal/{goalid}/members', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${bearerToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('response was not ok in get members');
        }
        return res.json();
      })
      .then((json) => {
        setMembers(json);
      })
      .catch((err) => {
        console.log('Error getting members: ' + err);
      });
        */
  }, [id]);

  return (
    <>
      <Header/>
    <div className={styles.goalContainer}>
      <div className={`${styles.column} ${styles.goalColumn}`}>
        {goalData ? (
          <>
            <Paper className={styles.goalPaper}>
              <Text className={styles.goalText}>{goalData.title}</Text>
              <Divider my="sm" />
              <Text>{goalData.description}</Text>
              {goalData.recurrence > 1 ? (
                <Text style={{ color: 'grey' }}>Recurring every {goalData.recurrence} days</Text>
              ) : (
                <Text style={{ color: 'grey' }}>Recurring every day</Text>
              )}
              <Divider my="sm" />
              <Button className ={styles.goalComplete}>
                Complete for today!
              </Button>
            </Paper>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className={`${styles.column} ${styles.membersColumn}`}>
        <Paper className={styles.membersPaper}>
          <Text className={styles.membersText}>Members</Text>
          {/* {members.map((member) => (
            <div key={member.id}>{member.name}</div>
          ))} */}
        </Paper>
      </div>
    </div>
    </>
  );
};

export default ViewGoal;
