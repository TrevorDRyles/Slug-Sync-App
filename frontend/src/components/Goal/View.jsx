import React, { useState, useEffect } from 'react';
import { Paper, Text, Divider, Button } from '@mantine/core';
import { useParams } from 'react-router-dom';
import styles from './Goal.module.css';
import Header from "@/components/Header.jsx";
import { GoalCard } from './GoalCard';
import Sidebar from "@/components/Sidebar.jsx";
import { useDisclosure } from "@mantine/hooks";

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
        setError('Error getting goal');
      });

    // Load comments
    fetch(`http://localhost:3010/v0/goal/${id}/comment`, {
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
        setComments(json);
      })
      .catch((err) => {
        console.log('Error getting comments: ' + err);
        setError('Error getting comments');
      });
    setCommentsChanged(false);
  }, [id, commentsChanged]);

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
              // 'Authorization': `Bearer ${bearerToken}`,
            },
          });
          if (!res.ok) {
            throw res;
          }
          const user = await res.json();
          fetchedUserNames[comment.user_id] = user.data.name;
        } catch (err) {
          console.log('Error getting user: ' + err);
          setError('Error getting user');
        }
      }));
      setUserNames(fetchedUserNames);
    };

    if (comments.length > 0) {
      fetchUserNames();
    }
  }, [comments]);

  const handleAddComment = () => {
    if (newComment.trim() === '') return;

    fetch(`http://localhost:3010/v0/goal/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ content: newComment, userId: '1e0d7c46-2194-4a30-b8e5-1b0a7c287e80', date: new Date() }),
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
        console.log('Error adding comment: ' + err);
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
  return (
    <>
      <div>{error}</div>
      <Header toggleSidebar={toggleSidebar} />

      <div className={styles.container}>
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
                        const avatarSrc = `https://www.clevelanddentalhc.com/wp-content/uploads/2018/03/sample-avatar.jpg`;
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
                </div>
              </div>
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
      <Sidebar sidebarOpened={sidebarOpened} />
    </>
  );
};

export default ViewGoal;
