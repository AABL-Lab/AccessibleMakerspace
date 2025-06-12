import React, {useEffect, useState} from 'react';
import UserCard from "../Components/userCards";
import axios from 'axios';

// ToDo: 
// 1. create restriction of how many cards on page (accessibility)
// 2. implement search (convenience)

export default function User(){
    const [idList, setIdList] = useState([]);
    const [userInfo, setUsers] = useState([]); 

    // On page load, the requestUsers fumnction is called to get all the users from server
    useEffect(() => {
      requestUsers();
    }, []);
    
    //this function sends a request to nodeJS backend to get all the users from the user server
    async function requestUsers() {
        try {
            const response = await axios.post('api/getUsers');
            if (response.data === false) {
            console.error('Error: Users data is not available');
            return;
            }
            //store the returned user's data
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    return (
        <div>
            {/* display the user cards */}
            <div className='cardLayout'>
                {userInfo.map(user => (
                    // sends user information to the usercard component so that each card is customized
                    <UserCard key={user.username} user={user}/>
                ))} 
            </div>
        </div>
    );
};