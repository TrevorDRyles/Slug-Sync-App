import React, {useState} from 'react';
import { TextInput, Paper, Button, Textarea, Select } from '@mantine/core';
import {useNavigate} from "react-router-dom";

let days = [{label: '1 day', value: `${1}`}];
for(let i = 2; i <= 31; i++) {
  days.push({label: `${i} days`, value: `${i}`});
}

// https://chat.openai.com/share/4da161a6-46be-448b-a884-107b5c2d63c2
function CreateGoal() {
  const history = useNavigate();


  const [recurrence, setRecurrence] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recurrence: `1`,
  });

  const handleChange = (field, value) => {
    // console.log(field, value);
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3010/v0/goal', {
      method: 'POST',
      body: JSON.stringify({title: formData.title, description: formData.description, recurrence: formData.recurrence}),
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${bearerToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('response was not ok in create goal');
        }
        return res.json();
      })
      .then((json) => {
        console.log('create goal response: ' + JSON.stringify(json));
        history('/');
      })
      .catch((err) => {
        console.log('Error creating goal: ' + err);
      });
  };

  return (
    <Paper padding="lg" shadow="xs" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>Create Goal</h1>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Title"
          placeholder="Enter text for Field 1"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          style={{ marginBottom: 15 }}
          id={"title"}
          data-testid={"title"}
        />
        <Textarea
          label="Description"
          description="Input description"
          placeholder=""
          onChange={(e) => handleChange('description', e.target.value)}
          required
          style={{ marginBottom: 15 }}
          value={formData.description}
          id={"description"}
          data-testid={"description"}
        />
        <Select
          data={days}
          label="Recurrence (every x days)"
          placeholder="1 day"
          value={formData.recurrence}
          onChange={(e) => handleChange('recurrence', e)}
          required
          style={{ marginBottom: 15 }}
          id={"recurrence"}
          data-testid={"recurrence"}
        />
        <Button data-testid="submit" type="submit" variant="outline" color="blue">
          Submit
        </Button>
      </form>
    </Paper>
  );
}

export default CreateGoal;
