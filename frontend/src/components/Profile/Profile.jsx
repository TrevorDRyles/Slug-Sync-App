import React, {useState} from 'react';
import {HoverCard, Card,  Avatar,  Image, Text, Badge, Group, Title, Divider, Paper} from '@mantine/core';
import {useNavigate} from "react-router-dom";
import styles from './Profile.module.css';
import {useDisclosure} from "@mantine/hooks";
import Header from "@/components/Header.jsx";
import Sidebar from "@/components/Sidebar.jsx";

const Profile = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [topGoals, setTopGoals] = useState([]);
    const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user')); // Retrieve user from localStorage
      if (!userId) {
        console.log('User ID not found in localStorage');
        return;
      }

      const userId = user.id;
      console.log(userId);
    
      fetch(`http://localhost:3010/v0/profile/${userId}`, {
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
          console.log('User Info:', json);
          // Process user information here
        })
        .catch((err) => {
          console.log('Error getting user info: ' + err);
        });
    
    }, []);
    

    return (
        <>
        <Header toggleSidebar={toggleSidebar}/>
        <div className={styles.container}> 
            <Card className = {`${styles.card_container}`} shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section>
                        <Image
                        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                        height={150}
                        alt="Norway"
                        />
                    </Card.Section>

                    <Avatar className = {styles.avatar} size = "xl" radius="xl"></Avatar>

                    <div className={`${styles.inner_container}`}>
                        <Group justify="space-between" mt="md" mb="xs">
                            <Text fw={500}>Name </Text>
                            <Text size="md">{userData && userData.name}</Text>
                            <HoverCard width={150} shadow="md">
                                <HoverCard.Target>
                                    <Badge color="red">50 Days</Badge>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                <Text size="sm">
                                    Longest current streak.
                                </Text>
                                </HoverCard.Dropdown>
                            </HoverCard>
                        </Group>

                        <Text ta="center" size="md" c="dimmed">
                          {userData && userData.bio}
                        </Text>
                    </div>
            </Card>

            <Paper padding="lg" shadow="sm" withBorder className = {`${styles.paper}`} >
                <Title order={1} >
                    Top Goals
                </Title>
                <Divider my="md" />
                <div className={`${styles.column} ${styles.goalColumn}`}>
                  {topGoals.length === 0 ? (
                    <div>Looking kinda empty there...</div>
                  ) : (
                    topGoals.map((goal, index) => (
                      <Paper key={index} className={styles.goalPaper}>
                        <Text aria-label={`goal-title-${goal.id}`} className={styles.goalText}>{goal.title}</Text>
                        <Divider my="sm" />
                        <Text>{goal.description}</Text>
                        {goal.recurrence > 1 ? (
                          <Text style={{ color: 'grey' }}>Recurring every {goal.recurrence} days</Text>
                        ) : (
                          <Text style={{ color: 'grey' }}>Recurring every day</Text>
                        )}
                        <Divider my="sm" />
                        <Button className={styles.goalComplete}>
                          Complete for today!
                        </Button>
                      </Paper>
                    ))
                  )}
                </div>
            </Paper>

            <Sidebar sidebarOpened={sidebarOpened}/>
        </div>
        </>
    );
}

export default Profile;