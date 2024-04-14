import SignIn from './components/SignIn/SignIn.tsx'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.jsx";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

/**
 * App
 * @return {object} JSX
 */
function App() {
  return (
  <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" default element={<SignIn />} />
          <Route path="/" default element={<Home />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
