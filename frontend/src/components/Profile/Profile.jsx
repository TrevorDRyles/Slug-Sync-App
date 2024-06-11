import React, {useState, useEffect} from 'react';
import {
  Button,
  HoverCard,
  Card,
  Avatar,
  Image,
  Text,
  Badge,
  Group,
  Title,
  Divider,
  Paper,
  Modal,
  TextInput
} from '@mantine/core';
import {IconPencil} from '@tabler/icons-react';
import {GoalCard} from '../Goal/GoalCard';
import styles from './Profile.module.css';
import {useDisclosure} from '@mantine/hooks';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [modalOpened, {open: openModal, close: closeModal}] = useDisclosure(false);
  const accessToken = JSON.parse(localStorage.getItem('user')).token

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const accessToken = JSON.parse(localStorage.getItem('user')).token
    if (!userId) {
      // console.log('User ID not found in localStorage');
      return;
    }

    fetch(`http://localhost:3010/v0/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
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
        setName(json.name || '');
        setBio(json.bio || '');
      })
      .catch((err) => {
        // console.log('Error getting user info: ' + err);
      });
  }, []);

  const handleEditClick = () => {
    openModal();
  };

  const handleSaveClick = async () => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const response = await fetch(`http://localhost:3010/v0/profile/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({id: userId, name, bio}),
    });
    const result = await response.json();
    // console.log(result)

    if (response.ok) {
      setUserData((prevData) => ({...prevData, name, bio}));
      closeModal();
    } else {
      // console.error('Failed to update profile:', result.message);
    }
  };


  return (
    <>
      <Header toggleSidebar={toggleSidebar}/>
      <div className={styles.container}>
        <Card className={`${styles.card_container}`} shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section>
            <Image
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
              height={150}
              alt="Norway"
            />
          </Card.Section>

          <Avatar className={styles.avatar} src={userData.img} size="xl" radius="xl"></Avatar>

          <div className={`${styles.inner_container}`}>
            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500} data-testid={"name"}>{userData.name}</Text>
              <HoverCard width={150} shadow="md">
                <HoverCard.Target>
                  <Badge color="red">1 Day </Badge>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="sm">Longest current streak.</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>

            <Text ta="center" size="md" c="dimmed" data-testid={"bio"}>
              {userData.bio || 'No bio.'}
            </Text>

            <Button variant="outline" size="xs" onClick={handleEditClick} className={styles.editButton}
                    data-testid={"edit button"}>
              <IconPencil size={16}/>
            </Button>
          </div>
        </Card>

        <Paper padding="lg" shadow="sm" withBorder className={styles.paper}>
          <Title order={1}>Top Goals</Title>
          <Divider my="md"/>
          <div className={`${styles.column} ${styles.goalColumn}`}>
            {userData.topGoals?.length === 0 ? (
              <div>Looking kinda empty there...</div>
            ) : (
              userData.topGoals?.map((goal, index) => <GoalCard key={index} goalData={goal}/>)
            )}
          </div>
        </Paper>

        <Sidebar sidebarOpened={sidebarOpened}/>
      </div>

      <Modal opened={modalOpened} onClose={closeModal} title="Edit Profile">
        <TextInput
          label="Name"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <TextInput
          label="Bio"
          placeholder="Bio"
          value={bio}
          onChange={(event) => setBio(event.currentTarget.value)}
        />
        <Group position="right" mt="md">
          <Button onClick={handleSaveClick}>Save</Button>
        </Group>
      </Modal>
    </>
  );
};

export default Profile;
