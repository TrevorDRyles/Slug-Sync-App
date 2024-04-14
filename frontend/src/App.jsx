import SignIn from './components/SignIn';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.jsx";

/**
 * App
 * @return {object} JSX
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" default element={<SignIn />} />
        <Route path="/" default element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
