import SignIn from './components/SignIn/SignIn.jsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.jsx";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import CreateGoal from "./components/Goal/Create.jsx";
import ViewGoals from "./components/Goal/Index.jsx";
import ViewGoal from "./components/Goal/View.jsx";
import { useState } from 'react';

/**
 * App
 * @return {object} JSX
 */
function App() {

  const [isLight, setIsLight] = useState(false);


  return (
  <MantineProvider theme={{height: '100vh'}} defaultColorScheme='light'>
      <BrowserRouter>
        <Routes>
          <Route path="/login" default element={<SignIn />} />
          <Route path="/createGoal" default element={<CreateGoal />} />
          <Route path="/goal/:id" default element={<ViewGoal />} />
          <Route path="/goals" default element={<ViewGoals />} />
          <Route path="/" default element={<Home />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
