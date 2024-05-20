import React, {useState, useEffect } from 'react';
import { Button, HoverCard, Card,  Avatar,  Image, Text, Badge, Group, Title, Divider, Paper} from '@mantine/core';
import { GoalCard } from '../Goal/GoalCard';
import styles from './Profile.module.css';
import {useDisclosure} from "@mantine/hooks";
import Header from "@/components/Header.jsx";
import Sidebar from "@/components/Sidebar.jsx";

const Profile = () => {
    const [userData, setUserData] = useState([]);
    const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState("");

    useEffect(() => {
      const userId = JSON.parse(localStorage.getItem('user')).id;
      if (!userId) {
        console.log('User ID not found in localStorage');
        return;
      }

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
          setUserData(json);
          console.log(userData.name);
        })
        .catch((err) => {
          console.log('Error getting user info: ' + err);
        });    
    }, []);

    {/*
    const topGoal = userData.topGoals?.[0];
    const highestStreak = topGoal?.streaks?.[0];

    const displayStreak = () => {
      if (highestStreak === undefined) {
        return "None";
      } else if (highestStreak === 1) {
        return "1 day";
      } else {
        return `${highestStreak} days`;
      }
    };

    const handleEditClick = () => {
      setIsEditing(true);
    };

    const handleCancelClick = () => {
      setIsEditing(false);
      setBio(userData.bio || "");
    };
    
    const handleSaveClick = async () => {
      try {
        const response = await fetch('http://localhost:3010/v0/profile/${userId}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bio }),
        });
        const result = await response.json();
        if (response.ok) {
          setUserData((prevData) => ({ ...prevData, bio }));
          setIsEditing(false);
        } else {
          console.error('Failed to update bio:', result.message);
        }
      } catch (error) {
        console.error('Error updating bio:', error);
      }
    };
    console.log(highestStreak);
  */}

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
                            <Text fw={500}>{userData && userData.name}</Text>
                            <HoverCard width={150} shadow="md">
                                <HoverCard.Target>
                                    <Badge color="red">1 Day </Badge>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                <Text size="sm">
                                    Longest current streak.
                                </Text>
                                </HoverCard.Dropdown>
                            </HoverCard>
                        </Group>

                        <Text ta="center" size="md" c="dimmed">
                          {userData && userData.bio == '' ? "No bio." : userData.bio}
                        </Text>
                        {/*
                        {isEditing ? (
                          <div>
                            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                            <Button onClick={handleSaveClick}>Save</Button>
                            <Button onClick={handleCancelClick}>Cancel</Button>
                          </div>
                        ) : (
                          <Button onClick={handleEditClick} className = "editBio">Edit Bio</Button>
                        )}
                        */}
                    </div>
            </Card>
            <Paper padding="lg" shadow="sm" withBorder className = {`${styles.paper}`} >
                <Title order={1} >
                    Top Goals
                </Title>
                <Divider my="md" />
                <div className={`${styles.column} ${styles.goalColumn}`}>
                    {userData.topGoals?.length === 0 ? (
                        <div>Looking kinda empty there...</div>
                    ) : (
                        userData.topGoals?.map((goal, index) => (
                          <GoalCard key={index} goalData={goal} />
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