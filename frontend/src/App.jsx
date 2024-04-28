import SignIn from './components/SignIn/SignIn.jsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.jsx";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import CreateGoal from "./components/Goal/Create.jsx";
import ViewGoal from "./components/Goal/View.jsx";
import { useState } from 'react';
import Index from "@/components/Goal/Index.jsx";

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
          <Route path="/goals" default element={<Index />} />
          <Route path="/goal/:id" default element={<ViewGoal />} />
          <Route path="/" default element={<Home />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
