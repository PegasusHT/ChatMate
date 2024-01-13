import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() => {
        const checkUserSignIn = async () => {
            const user = localStorage.getItem('user');
            if (user) {
                const { userId, username } = JSON.parse(user);
                setId(userId);
                setUsername(username);
              } 
            // try {
            //     const response = await axios.get('/profile');
            //     setId(response.data.userId);
            //     setUsername(response.data.username);
            // } catch (error) {
            //     // Handle error when user is not signed in
            //     console.log("User is not signed in");
            // }
        };

        checkUserSignIn();
    }, []);

    return (
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}