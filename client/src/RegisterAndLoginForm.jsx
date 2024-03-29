import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";
import Intro from "./Intro.jsx";
import { useMediaQuery } from 'react-responsive';
import Logo from "./Logo.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login';
    const {data} = await axios.post(url, {username,password});
    setLoggedInUsername(username);
    setId(data.id);
    localStorage.setItem('user', JSON.stringify({ userId: data.id, username }));
  }
  
  return (
    <div className={`bg-blue-50 h-screen flex items-center justify-center ${isMobile ? 'flex-col' : ''}`}>
      <div className='flex flex-col'>
        <div className={` ${isMobile ? 'mt-36' : ''}`}>
          <Logo isFrontPage={true}/>
        </div>
        <form className="w-64 mx-auto" onSubmit={handleSubmit}>
          <input value={username}
                onChange={ev => setUsername(ev.target.value)}
                type="text" placeholder="username"
                className="block w-full rounded-sm p-2 mb-2 border" />
          <input value={password}
                onChange={ev => setPassword(ev.target.value)}
                type="password"
                placeholder="password"
                className="block w-full rounded-sm p-2 mb-2 border" />
          <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
            {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
          </button>
          <div className="text-center mt-2">
            {isLoginOrRegister === 'register' && (
              <div>
                Already a member?
                <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                  Login here
                </button>
              </div>
            )}
            {isLoginOrRegister === 'login' && (
              <div>
                Dont have an account?
                <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                  Register
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      <Intro />
    </div>
  );
}