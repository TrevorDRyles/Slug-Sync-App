import SignIn from './components/SignIn';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

/**
 * App
 * @return {object} JSX
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" default element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
