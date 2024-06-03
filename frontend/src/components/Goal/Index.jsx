import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Card, Text, TextInput, Badge, Group, Menu, Paper, Divider} from '@mantine/core';
import {Link, useNavigate} from "react-router-dom";
import styles from './Goal.module.css';
import Header from "@/components/Header.jsx";
import {useDisclosure} from "@mantine/hooks";
import Sidebar from "@/components/Sidebar.jsx";
import {IconTag, IconSortAscending, IconSortDescending, IconX} from '@tabler/icons-react';

let tags =['Health','Athletics','Productivity','Academics','Social','Hobbies','Finance and Bills','Work','Personal','Other'];

const GoalsListing = () => {
  // https://chat.openai.com/share/5c73d542-08b5-4772-96ab-c9eecd503ba1
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTag, setFilterTag] = useState('');
  const goalsPerPage = 4;
  const history = useNavigate();
  // const indexOfLastGoal = currentPage * goalsPerPage;
  const userToken = JSON.parse(localStorage.getItem('user')).token;
  // const indexOfFirstGoal = indexOfLastGoal - goalsPerPage;
  let [goals, setGoals] = useState([]);
  // let currentGoals = [];
  const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);
  const [sort, setSort] = useState(1);

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleTagSelect = () => {
    setCurrentPage(1); //hacky solution for now
  };

  const handleAddGoal = (goal) => {
    // navigate to goal page with history
    history(`/goal/${goal.id}`);
    // call an api to add goal
    fetch(`http://localhost:3010/v0/goal/${goal.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('response was not ok in add goal');
        }
        return res.json();
      })
      .catch((err) => {
        console.log('Error adding goal: ' + err);
      });
  };

  // let filteredGoals = [];

  // const updateFilteredGoals = (searchTerm) => {
  //   filteredGoals = currentGoals.filter((goal) =>
  //     goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  // }

  const handleFilterTag = (tag) => {
    let tagText = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    setFilterTag(tagText);
  };

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
  };

  useEffect(() => {
    const searchTerm = searchQuery.length > 0 ? '&search=' + encodeURIComponent(searchQuery) : ''
    const filterTerm = filterTag.length > 0 ? '&tag=' + filterTag : ''
    fetch(`http://localhost:3010/v0/goal?page=${currentPage}&size=${goalsPerPage}${filterTerm}${searchTerm}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('response was not ok in get goals');
        }
        return res.json();
      })
      .then((data) => {
        setGoals(data);
        // goals = data;
        // currentGoals = goals.slice(indexOfFirstGoal, indexOfLastGoal);
        // filteredGoals = currentGoals;
        // filteredGoals = currentGoals.filter((goal) =>
        //   goal.title.toLowerCase().includes(searchQuery.toLowerCase())
        // );
        // console.log(data);
      })
      .catch((err) => {
        alert(err.message);
      });
    }, [currentPage, searchQuery, filterTag, userToken]);

  // https://chat.openai.com/share/92235a8f-fdb7-4143-9674-69af74f89174
  return (
    <div className={styles.grayBackground}>
      <Header toggleSidebar={toggleSidebar}/>
      <div className={styles.topContainer}>
        <div className={styles.secondToTopContainer}>
          <div className={styles.goalsContainer}>
            <h1>
              <Text
                size="3xl"
                fw={900}
                variant="gradient"
                gradient={{from: 'blue', to: 'cyan', deg: 321}}
              >
                Goals
              </Text>
            </h1>
          </div>
        <div style={{ display: 'flex' }}>
            <TextInput
              id={'search-filter-goals'}
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(event) => handleSearch(event.target.value)}
              style={{marginBottom: '20px', width: '90%'}}
              rightSectionWidth={180}
              rightSection={filterTag &&
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '95%' }}>
                <Badge
                  aria-label='filter-badge'
                  leftSection={<IconTag style={{width: 16, height: 16}}/>}
                  rightSection={ <IconX aria-label='remove-filter' className={styles.close} style={{width: 14, height: 14, }} onClick={() => setFilterTag('')}/>}
                >
                  {filterTag}
                </Badge>
              </div>
            }
          />
          <Menu shadow="md" width={200} transitionProps={{ transition: 'scale-y', duration: 180}}>
            <Menu.Target >
              <Button aria-label='filter-menu-button' style={{marginLeft: '8px', width: '9%'}}>
                <IconTag style={{width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0}}/>
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Select a tag</Menu.Label>

              {
                tags.map((tag, index) => (
                  <Menu.Item aria-label={`menu-item-${tag}`} key={index} onClick={(event) => {handleTagSelect(); handleFilterTag(event.target.textContent);}}>
                    <Badge
                      data-testid={"tag"}
                      style={{backgroundColor: 'white', color: '#228be6'}}
                      leftSection={<IconTag style={{width: 16, height: 16}}/>}>
                        {tag}
                    </Badge>
                  </Menu.Item>
                ))
              }
            </Menu.Dropdown>

          </Menu>

          {/* <Button
            style={{marginLeft: '8px', width: '9%'}}
            aria-label='sort-button'
            onClick={handleSort}>
              {sort ? <IconSortAscending aria-label='asc-icon' style={{width: 20, height: 20}}/> : <IconSortDescending aria-label='desc-icon' style={{width: 20, height: 20}}/>}
          </Button> */ /**Commented out for now since use case of sort by member/date button uncertain */}
        </div>
          {goals.map((goal, index) => (
            <div key={`goal-${index}`}>
              <Goal key={goal.id} goal={goal} onAddGoal={() => handleAddGoal(goal)}/>
              <br/>
            </div>
              ))}
          <Button disabled={currentPage === 1} onClick={handlePrevPage}>Previous Page</Button>
          <Button disabled={false} onClick={handleNextPage} style={{marginLeft: '10px'}}>Next Page</Button>
        </div>
      </div>
      <Sidebar sidebarOpened={sidebarOpened}/>
    </div>
  );
};

const Goal = ({ goal, onAddGoal }) => {
  return (
    <Card shadow="xs" className={styles.goal}>
      <div>
        <Link aria-label={`goal-link-${goal.id}`} className={styles.goalLink} to={'/goal/' + goal.id}>
          <Group justify="space-between">
            <Text size="lg" style={{flexGrow: 1}}>
              {goal.title}
            </Text>
            {goal.tag !== '' && goal.tag !== undefined ?
              (<Badge data-testid={"tag"}
                      style={{backgroundColor: 'white', color: '#228be6'}}
                      leftSection={<IconTag style={{width: 16, height: 16}}/>}>{goal.tag}</Badge>) : (<></>)
            }
          </Group>
        </Link>
        <Divider my="sm"/>
        <Text>{goal.description}</Text>
        <Text style={{color: 'grey'}}>Recurring every {goal.recurrence}</Text>
        <Text style={{color: 'grey'}}>Members: {goal.memberCount}</Text>
        <Divider my="sm"/>
        <Button onClick={onAddGoal} style={{marginLeft: '10px'}}>Add Goal</Button>
      </div>
    </Card>
  );
};

Goal.propTypes = {
  goal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    memberCount: PropTypes.number,
    tag: PropTypes.string,
    description: PropTypes.string.isRequired,
    recurrence: PropTypes.string.isRequired,
  }).isRequired,
  onAddGoal: PropTypes.func.isRequired,
};

export default GoalsListing;
