import React, {useState} from 'react';
import {HoverCard, Card,  Avatar,  Image, Text, Badge, Group, Title, Divider, Paper} from '@mantine/core';
import {useNavigate} from "react-router-dom";
import styles from './Profile.module.css';
import {useDisclosure} from "@mantine/hooks";
import Header from "@/components/Header.jsx";
import Sidebar from "@/components/Sidebar.jsx";

const Profile = () => {
    const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);

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
                            This is a bio. 
                        </Text>
                    </div>
            </Card>

            <Paper padding="lg" shadow="sm" withBorder className = {`${styles.paper}`} >
                <Title order={1} >
                    Top Goals
                </Title>
                <Divider my="md" />
            </Paper>

            <Sidebar sidebarOpened={sidebarOpened}/>
        </div>
        </>
    );
}

export default Profile;