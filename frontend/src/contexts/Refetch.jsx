import {createContext, useState} from 'react';
import PropTypes from 'prop-types'

export const RefetchContext = createContext();

export const RefetchProvider = ({children}) => {
  const [refetch, setRefetch] = useState(false)
  return (
    <RefetchContext.Provider value={{refetch, setRefetch}}>
      {children}
    </RefetchContext.Provider>
  )
}

RefetchProvider.propTypes = {
  children: PropTypes.node.isRequired,
}