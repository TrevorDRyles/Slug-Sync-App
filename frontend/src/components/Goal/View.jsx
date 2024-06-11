import React, { useState, useEffect, useContext } from 'react';
import {Paper, Text, Divider, Button, Modal, Table, Badge} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Goal.module.css';
import Header from "@/components/Header.jsx";
import { GoalCard } from './GoalCard';
import Sidebar from "@/components/Sidebar.jsx";
import { useDisclosure } from "@mantine/hooks";
import { LoginContext } from '../../contexts/Login';

// https://chatgpt.com/share/1e49ddf9-1e32-42f0-809e-2c7b4d472f53
const ViewGoal = () => {
  const { id } = useParams();
  const [goalData, setGoalData] = useState(null);
  const [members, setMembers] = useState([]);
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsChanged, setCommentsChanged] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [error, setError] = useState(null);
  const {accessToken} = useContext(LoginContext)
  const history = useNavigate();

  // console.log(comments)

  useEffect(() => {
    if (!accessToken)
      return;
    fetch(`http://localhost:3010/v0/goal/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
        // console.log('Error getting goal: ' + err);
        setError('Error getting goal');
      });

    // Load comments
    fetch(`http://localhost:3010/v0/goal/${id}/comment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      })
      .then((json) => {
        setComments(json);
      })
      .catch((err) => {
        // console.log('Error getting comments: ' + err);
        setError('Error getting comments');
      });
    setCommentsChanged(false);
  }, [id, commentsChanged, accessToken]);

  useEffect(() => {
    if (!accessToken)
      return;
    // load members
    fetch(`http://localhost:3010/v0/goal/${id}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error getting goal members')
        }
        return res.json();
      })
      .then(data => {
        // console.log("Member Data:", data);
        setMembers(data);
      })
      .catch((err) => {
        // console.log("Unable to get goal members: " + err);
      })
  }, [accessToken, id]);

  // load usernames from the comment
  useEffect(() => {
    const fetchUserNames = async () => {
      const fetchedUserNames = {};
      await Promise.all(comments.map(async (comment) => {
        try {
          const res = await fetch(`http://localhost:3010/v0/user/${comment.user_id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (!res.ok) {
            throw res;
          }
          const user = await res.json();
          fetchedUserNames[comment.user_id] = user.data.name;
        } catch (err) {
          // console.log('Error getting user: ' + err);
          setError('Error getting user');
        }
      }));
      setUserNames(fetchedUserNames);
    };

    if (comments.length > 0) {
      fetchUserNames();
    }
  }, [accessToken, comments]);

  const handleAddComment = () => {
    if (newComment.trim() === '') return;

    fetch(`http://localhost:3010/v0/goal/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: newComment, date: new Date() }),
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      })
      .then((comment) => {
        setCommentsChanged(true);
        setNewComment('');
      })
      .catch((err) => {
        // console.log('Error adding comment: ' + err);
        setError('Error adding comment');
      });
  };

  // grouped posts code referenced from Trevor Ryles CSE 187 hw 3
  const groupCommentsByDate = (comments) => {
    // sort by newest first
    const sortedComments = comments.sort((a, b) => new Date(a.data.date) - new Date(b.data.date)).reverse();
    const groupedComments = {};
    sortedComments.forEach((comment) => {
      const date = (new Date(comment.data.date)).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).split(',')[0];
      if (groupedComments[date]) {
        groupedComments[date].push(comment);
      } else {
        groupedComments[date] = [comment];
      }
    });

    return groupedComments;
  };
  const groupedComments = groupCommentsByDate(comments);

  // https://chat.openai.com/share/e0cc8fb0-3bab-454d-9476-7e4c322670c3
  function isSameDay(date) {
    const today = new Date;
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  // https://chat.openai.com/share/e0cc8fb0-3bab-454d-9476-7e4c322670c3
  function formatDateToTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes + " " + ampm;
  }

  // https://chat.openai.com/share/59dea79e-4f79-49bf-ae54-263b09441f0b
  function formatDate(inputDate) {
    const date = new Date(inputDate + 'Z');

    const monthsOfYear = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthsOfYear[date.getMonth()];
    const dateOfMonth = date.getDate();
    if (isSameDay(date)) {
      return "Today @ " + formatDateToTime(date);
    }
    return `${month.slice(0, 3)} ${dateOfMonth} @ ${formatDateToTime(date)}`;
  }

  // https://chatgpt.com/share/23b6a8ff-7ebf-45d9-99c1-75a00eeaf8d8
  const handleDelete = () => {
    fetch(`http://localhost:3010/v0/goal/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return;
      })
      .then(() => {
        // console.log('Goal deleted successfully');
        history('/goals');
      })
      .catch((err) => {
        // console.log('Error deleting goal: ' + err);
      });
  };

  const handleLeave = () => {
    fetch(`http://localhost:3010/v0/goal/${id}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      })
      .then(() => {
        // console.log('Left goal successfully');
        history('/goals');
      })
      .catch((err) => {
        // console.log('Error leaving goal: ' + err);
      });
  };

  const roleColors = {
    author: 'red',
    member: 'cyan',
  }

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <div>{error}</div>
      <Header toggleSidebar={toggleSidebar} />
      <div className={styles.containerForView}>
      <Modal opened={opened} onClose={close} title="Delete Goal">
        <p>Are you sure you would like to delete this goal?</p>
        <Button aria-label={'Confirm Delete Goal'} onClick={handleDelete} fullWidth variant="outline" color="red">
          Yes, confirm delete
        </Button>
        <br></br>
        <Button onClick={close} fullWidth>
          Nevermind
        </Button>
      </Modal>
        <div className={`${styles.column} ${styles.goalColumn}`}>
          {goalData ? (
            <>
              <GoalCard goalData={goalData} />
              <div id="comments" className={styles.commentsSection}>
                <Text className={styles.commentsTitle}>Comments</Text>
                <div className={styles.commentsList}>
                  {Object.entries(groupedComments).map(([date, comments]) => (
                    <div key={date} className={styles.commentGroup}>
                      <Text className={styles.commentDate}>{date}</Text>
                      {comments.map((comment, index) => {
                        const userName = userNames[comment.user_id] || 'Loading...';
                        const avatarSrc = comment.user_data && comment.user_data.img ? comment.user_data.img : 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg';
                        return (
                          <Paper aria-label={`Comment ${index + 1}`} key={`${index}-${comment.id}`} className={styles.comment}>
                            <div className={styles.commentHeader}>
                              <img src={avatarSrc} alt={userName} className={styles.avatar} />
                              <div className={styles.commentInfo}>
                                <Text className={styles.userName}>{userName}</Text>
                                <Text className={styles.commentDate}>{formatDate(comment.data.date)}</Text>
                              </div>
                            </div>
                            <Text className={styles.commentText}>{comment.data.content}</Text>
                          </Paper>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className={styles.addComment}>
                <textarea
                  aria-label={'Type comment'}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className={styles.commentInput}
                  placeholder="Add a comment"
                />
                  <Button aria-label={'Post comment'} onClick={handleAddComment} className={styles.commentButton}>
                    Add Comment
                  </Button>
              <br></br>
              <br></br>
                  <div className={styles.removeWrapper}>
                    <Button aria-label={'Delete Goal'} onClick={open} variant="outline" color="red">
                      Delete goal
                    </Button>
                    <Button aria-label={'Leave Goal'} onClick={handleLeave} variant="outline" color="red">
                      Leave Goal
                    </Button>
                </div>
                </div>
              </div>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
        <div className={`${styles.column} ${styles.membersColumn}`}>
          <Paper className={styles.membersPaper}>
            <Table.ScrollContainer minWidth={200}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Members</Table.Th>
                    <Table.Th>Role</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {members.map((member) => (
                    <Table.Tr key={member.id}>
                      <Table.Td style={{textAlign: 'left'}}>
                        <Text>{member.username}</Text>
                      </Table.Td>
                      <Table.Td style={{textAlign: 'left'}}>
                        <Badge color={roleColors[member.role.toLowerCase()]} variant="light">
                          {member.role}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </div>
      </div>
      <Sidebar sidebarOpened={sidebarOpened} />
    </>
  );
};

export default ViewGoal;
