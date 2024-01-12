import axios from 'axios';
import { UserContextProvider } from './UserContext';
import Routes from './Routes';

function App() {
  axios.defaults.baseURL= 'https://cors-anywhere.herokuapp.com/'+import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials= true;

  return(
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
