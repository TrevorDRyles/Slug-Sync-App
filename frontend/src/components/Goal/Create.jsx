import React, {useState} from 'react';
import {TextInput, Paper, Button, Textarea, Select, Divider, Text, rem} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import {useNavigate} from "react-router-dom";
import styles from './Goal.module.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import {useDisclosure} from "@mantine/hooks";
import Header from "@/components/Header.jsx";
import Sidebar from "@/components/Sidebar.jsx";

// add days for recurrence
let days = [{label: '1 day', value: `${1}`}];
for(let i = 2; i <= 31; i++) {
  days.push({label: `${i} days`, value: `${i}`});
}

//add basic tags
let tags = [
  {label: 'Health', value: 'Health'},
  {label: 'Athletics', value: 'Athletics'},
  {label: 'Productivity', value: 'Productivity'},
  {label: 'Academics', value: 'Academics'},
  {label: 'Social', value: 'Social'},
  {label: 'Hobbies', value: 'Hobbies'},
  {label: 'Finance and Bills', value: 'Finance'},
  {label: 'Work', value: 'Work'},
  {label: 'Personal', value: 'Personal'},
  {label: 'Other', value: 'Other'},
];

// https://chat.openai.com/share/4da161a6-46be-448b-a884-107b5c2d63c2
function CreateGoal() {
  const userToken = JSON.parse(localStorage.getItem('user')).token;
  const userId = JSON.parse(localStorage.getItem('user')).id;
  const history = useNavigate();
  const [sidebarOpened, {toggle: toggleSidebar}] = useDisclosure(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recurrence: `1`,
    tag: '',
    completed: false,
    startdate: '',
    enddate: '',
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);
  const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

  const handleStartDateChange = (date) => {
    if (date && endDate && date > endDate) {
      setStartDateError('Start date cannot be after end date');
    } else {
      setStartDate(date);
      setStartDateError('');
      handleChange('startdate', formatDate(date));
    }
  };

  const handleEndDateChange = (date) => {
    if (date && startDate && date < startDate) {
      setEndDateError('End date cannot be before start date');
    } else {
      setEndDate(date);
      setEndDateError('');
      handleChange('enddate', formatDate(date));
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3010/v0/goal', {
      method: 'POST',
      body: JSON.stringify({title: formData.title, description: formData.description, recurrence: formData.recurrence + " days", author: userId, tag: formData.tag, comments: [], startdate: formData.startdate, enddate: formData.enddate, memberCount: 1}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('response was not ok in create goal');
        }
        return res.json();
      })
      .then((json) => {
        history(`/goal/${json.id}`);
      })
      .catch((err) => {
        console.log('Error creating goal: ' + err);
      });
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar}/>
      <div className={styles.container}>
        <div className={`${styles.column} ${styles.goalColumn}`}>
        <Paper padding="lg" shadow="lg" className={styles.goalPaper} style={{ maxHeight: 900, maxWidth: 900, margin: '0 auto', borderRadius: '14px' }}>
          <div className={styles.goalText}>
            <Text
              size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 321 }}
            >
              Create Goal
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="formContainer">
            <TextInput
              label="Title"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              style={{ marginBottom: 15 }}
              id={"title"}
              data-testid={"title"}
            />
            <Textarea
              label="Description"
              placeholder="Enter description"
              onChange={(e) => handleChange('description', e.target.value)}
              required
              style={{ marginBottom: 15 }}
              value={formData.description}
              id={"description"}
              data-testid={"description"}
              autosize
              minRows={3}
              maxRows={6}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <Select
                data={days}
                label="Repeat goal every ..."
                placeholder="1 day"
                value={formData.recurrence}
                onChange={(e) => handleChange('recurrence', e)}
                required
                style={{ marginBottom: 15 }}
                id={"recurrence"}
                data-testid={"recurrence"}
                flex={1}
              />
              <Select
                data = {tags}
                label="Select a tag"
                placeholder="Select a tag"
                value={formData.tag}
                onChange={(e) => handleChange('tag', e)}
                style={{ marginBottom: 15 }}
                id={"tag"}
                data-testid={"tag"}
                flex={1}
                //searchable
              />
            </div>
            <DatePickerInput
              leftSection={icon}
              style={{ marginBottom: 15 }}
              leftSectionPointerEvents="none"
              label="Start Date"
              required
              error={startDateError}
              placeholder="Select start date"
              value={startDate}
              id={"startdate"}
              data-testid={"startdate"}
              onChange={handleStartDateChange}
            />
            <DatePickerInput
              leftSection={icon}
              style={{ marginBottom: 15 }}
              leftSectionPointerEvents="none"
              label="End Date"
              value={endDate}
              error={endDateError}
              data-testid={"enddate"}
              id={'enddate'}
              onChange={handleEndDateChange}
              placeholder="Select end date"
            />
            <Button data-testid="submit" type="submit" variant="outline" color="blue">
              Submit
            </Button>
          </form>
        </Paper>
      </div>
      </div>
      <Sidebar sidebarOpened={sidebarOpened}/>
    </>
  );
}

export default CreateGoal;
