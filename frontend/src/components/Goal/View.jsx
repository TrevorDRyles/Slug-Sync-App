import React, { useState, useEffect } from 'react';
import { Paper, Text, Divider, Button} from '@mantine/core';
import { useParams } from 'react-router-dom';
import styles from './Goal.module.css';
import Header from "@/components/Header.jsx";
import { GoalCard } from './GoalCard';
import Sidebar from "@/components/Sidebar.jsx";
import {useDisclosure} from "@mantine/hooks";

const ViewGoal = () => {
  const { id } = useParams();
  const [goalData, setGoalData] = useState(null);
  const [members, setMembers] = useState([]);
  const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);

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
  }, [id]);

  return (
    <>
      <Header toggleSidebar={toggleSidebar}/>
      <div className={`${styles.container}`}>
      <div className={`${styles.column} ${styles.goalColumn}`}>
        {goalData ? (
          <>
            <GoalCard goalData={goalData} />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className={`${styles.column} ${styles.membersColumn}`}>
        <Paper className={styles.membersPaper}>
          <Text className={styles.membersText}>Members</Text>
        </Paper>
      </div>
    </div>
      <Sidebar sidebarOpened={sidebarOpened}/>
    </>
  );
};

export default ViewGoal;
