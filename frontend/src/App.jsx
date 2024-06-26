import SignIn from './components/SignIn/SignIn.jsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.jsx";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import CreateGoal from "./components/Goal/Create.jsx";
import ViewGoal from "./components/Goal/View.jsx";
import React, { useState } from 'react';
import { LoginContext } from './contexts/Login.jsx';
import Index from "@/components/Goal/Index.jsx";
import { RefetchProvider } from './contexts/Refetch.jsx';
import Profile from "./components/Profile/Profile.jsx";

/**
 * App
 * @return {object} JSX
 */
function App() {

  const [accessToken, setAccessToken] = React.useState('')
  const [user, setUser] = React.useState({})

  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const json = JSON.parse(user)
      setAccessToken(json.token)
      setUser(json)
    }
  }, [])

  return (
  <MantineProvider theme={{height: '100vh'}} defaultColorScheme='light'>
    <LoginContext.Provider value={{accessToken, setAccessToken, user, setUser}}>
      <RefetchProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" default element={<SignIn />} />
              <Route path="/createGoal" default element={<CreateGoal />} />
              <Route path="/goals" default element={<Index />} />
              <Route path="/goal/:id" default element={<ViewGoal />} />
              <Route path="/profile/:id" default element={<Profile/>}/>
              <Route path="/" default element={<Home/>}/>
            </Routes>
          </BrowserRouter>
        </RefetchProvider>
      </LoginContext.Provider>
    </MantineProvider>
  );
}

export default App;
