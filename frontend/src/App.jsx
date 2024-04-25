import SignIn from './components/SignIn/SignIn.tsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.jsx";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import CreateGoal from "./components/Goal/CreateGoal.jsx";
import ViewGoal from "./components/Goal/ViewGoal.jsx";


function App() {
  return (
  <MantineProvider theme={{height: '100vh'}}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" default element={<SignIn />} />
          <Route path="/createGoal" default element={<CreateGoal />} />
          <Route path="/goal/:id" default element={<ViewGoal />} />
          <Route path="/" default element={<Home />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
