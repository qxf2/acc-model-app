import axios from "axios";
import { useState, useEffect } from "react";


const Users = () => {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const getUsers = async () => {
            try {
                const response = await axios.get('/users', { signal: controller.signal });
                console.log(response.data);
                if (isMounted) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        }

        getUsers();

        return () => {
            isMounted = false;
            controller.abort();
            }
        }, [])

        return (
            <article>
                <h2>Users</h2>
                {users?.length
                    ? (
                        <ul>
                            {users.map((user, i) => <li key={i}>{user.username}</li>)}
                        </ul>
                    ) : (
                        <p>No users</p>
                    )}
            </article>
        );

    };
    
export default Users