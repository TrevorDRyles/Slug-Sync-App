import {createContext, useState} from "react";
import PropTypes from 'prop-types';

export const LoginContext = createContext();

export const LoginProvider = ({children}) => {
  const [accessToken, setAccessToken] = useState('')

  return (
    <LoginContext.Provider value={{accessToken, setAccessToken}}>
      {children}
    </LoginContext.Provider>
  )
}

LoginProvider.propTypes = {
  children: PropTypes.node.isRequired,
};