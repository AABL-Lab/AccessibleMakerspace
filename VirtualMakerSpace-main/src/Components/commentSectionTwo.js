import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import '../Styling/commentSectionTwo.css';

export default function CommentSection({projID}) {
    // State for storing comments
    const [comments, setComments] = useState([]);
    const commentSectionReference = useRef(null);
    const [username, setUsername] = useState('');
    const [idNumber, setidNumber] = useState(0);
    const [existingComments, setOldComments] = useState([]);

    //once the project ID is recieved when singleProj loads
    useEffect(() => { 
        if (projID && projID.startsWith("id")) {
            let id = parseInt(projID.replace("id", ""))
            setidNumber(id);
            setUsername(sessionStorage.getItem('account'))
            getProjectComments(id);
        }
    },[projID]);

    //function call to the backend to get the project's comments from the server 
    async function getProjectComments(id){
        try{
            const response = await axios.post('/api/getProjectComments', {projID: id});
            console.log(response.data);
            // setComments(response.data); //adding it causes an error stating array  isnt initialized
            setOldComments(response.data);
        }catch(error){
            console.log("Comment Error: " + error)
        }
    }

    // Function to add a new comment
    const addComment = (message, username) => {
        const newComment = {
            id: comments.length + 1, // Unique ID for the comment
            user: username, 
            message: message,
            // likes: 0,
            replies: [], // Array to store replies
            showReplyBox: false // Initially hide reply box
        };
        //add comments in the array
        setComments([...comments, newComment]);
        //store the comments in the server
        pushComments(message);
        //once the section gets to a certain size, enable scroll feature
        commentSectionReference.current.style.overflowY = 'scroll';
    };

    // send new comments to the sever for storage 
    async function pushComments(message){
        let key = sessionStorage.getItem('key');
        try{
           const response = await axios.post('/api/createComment', {username: username, password: key, projID: Number(idNumber), comment: message});
        }catch(error){
            console.log("Comment Error: " + error)
        }
    }

    // Function to handle liking a comment or reply
    // const likeItem = (itemId, isComment) => {
    //     const updatedComments = comments.map(comment => {
    //         if (comment.id === itemId && isComment) {
    //             return { ...comment, likes: comment.likes + 1 };
    //         } else if (!isComment) {
    //             const updatedReplies = comment.replies.map(reply => {
    //                 if (reply.id === itemId) {
    //                     return { ...reply, likes: reply.likes + 1 };
    //                 }
    //                 return reply;
    //             });
    //             return { ...comment, replies: updatedReplies };
    //         }
    //         return comment;
    //     });
    //     setComments(updatedComments);
    // };

    // Function to toggle display of reply input field
    const toggleReplyBox = (parentId) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [
                        ...comment.replies,
                        {
                            id: comment.replies.length + 1,
                            message: '',
                            // likes: 0,
                            showReplyBox: true
                        }
                    ]
                };
            } else {
                const updatedReplies = comment.replies.map(reply => {
                    if (reply.id === parentId) {
                        return { ...reply, showReplyBox: !reply.showReplyBox };
                    } else {
                        return { ...reply, showReplyBox: false };
                    }
                });
                return { ...comment, replies: updatedReplies };
            }
        });
        setComments(updatedComments);
    };


    // Function to add a reply to a comment or a reply
    const addReply = (parentId, replyMessage, username) => {
        const updatedComments = comments.map(comment => {
            if (comment.id === parentId) {
                // Add reply to comment
                return {
                    ...comment,
                    replies: [
                        ...(comment.replies || []), // Ensure replies array exists
                        {
                            id: (comment.replies ? comment.replies.length : 0) + 1,
                            username: username, 
                            message: replyMessage,
                            // likes: 0,
                            showReplyBox: false // Initially hide reply box
                        }
                    ]
                };
            } else if (comment.replies && comment.replies.some(reply => reply.id === parentId)) {
                // Add reply to a reply
                return {
                    ...comment,
                    replies: comment.replies.map(reply => {
                        if (reply.id === parentId) {
                            return {
                                ...reply,
                                replies: [
                                    ...(reply.replies || []), // Ensure nested replies array exists
                                    {
                                        id: (reply.replies ? reply.replies.length : 0) + 1,
                                        message: replyMessage,
                                        // likes: 0,
                                        showReplyBox: false // Initially hide reply box
                                    }
                                ]
                            };
                        }
                        return reply;
                    })
                };
            }
            return comment;
        });
        setComments(updatedComments);
    };

    // Recursive component for rendering nested replies
    const renderReplies = (replies, parentId) => {
        if (!replies) return null;

        return replies.map(reply => (
            <div key={reply.id} className="reply">
                    {/* todo: Add space for username */}
                    <p className="reply-username">{reply.username}</p>
                <div class="reply-message"><p>{reply.message}</p></div>
                {/* <p>{reply.message}</p> */}
                <div className="like-reply-section">
                    {/* Render like and reply buttons for existing replies */}
                    {reply.id > comments.length && (
                        <>
                            {/* <button className="like-button" onClick={() => likeItem(reply.id, false)}>Like ({reply.likes})</button> */}
                            <button className="reply-button" onClick={() => toggleReplyBox(reply.id)}>Reply</button>
                        </>
                    )}
                </div>
                {/* Reply input field for newly added replies */}
                {reply.showReplyBox && (
                    <div className="reply-section">
                        <input 
                            type="text" 
                            placeholder="Reply..." 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                    addReply(parentId, e.target.value);
                                    e.target.value = '';
                                }
                            }}
                            className="reply-input"
                            
                        />
                    </div>
                )}
                {/* Recursive call for nested replies */}
                {renderReplies(reply.replies, parentId)}
            </div>
        ));
    };


    return (
        <div ref={commentSectionReference} className="comment-section">
            <h2>Comments</h2>

            {/* Input field for adding comments */}
            <div className="comment-input-container">
                <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                            addComment(e.target.value);
                            e.target.value = '';
                        } 
                    }}
                    className="comment-input"
                />
                <button 
                    className="send-button"
                    onClick={() => {
                        const input = document.querySelector('.comment-input');
                        if (input.value.trim() !== '') {
                            addComment(input.value);
                            input.value = '';
                        }
                    }}
                >
                    Send
                </button>

            </div>

            {/* Display comments */}
            {/* {comments.map(comment => ( */}
            {[...comments, ...existingComments].map(comment => (
                <div key={comment.id} className="comment">
                    {/* Add space for username */}
                        <p className="comment-username">{comment.user}</p>
                    <div className="comment-body">
                        <p className="comment-message">
                            <p className="message-text">{comment.message || comment.content}</p>
                            {/* <span className="message-text">{comment.message}</span> */}
                            <img src={"./images/robot_new.jpg"} alt="Profile" className="profile-picture" />
                        </p>
                    </div>
                    {/* Like and reply buttons */}
                    <div className="like-reply-section">
                        {!comment.isReply && ( // Only show for initial comments
                            <>
                                {/* <button className="like-button" onClick={() => likeItem(comment.id, true)}>Like ({comment.likes})</button> */}
                                <button className="reply-button" onClick={() => toggleReplyBox(comment.id)}>Reply</button>
                            </>
                        )}
                    </div>
                    {/* Reply section */}
                    {comment.showReplyBox && (
                        <div className="reply-section">
                            {/* Reply form for comment */}
                            <input 
                                type="text" 
                                placeholder="Reply..." 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                        addReply(comment.id, e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="reply-input" 
                            />
                        </div>
                    )}
                    {/* Display replies */}
                    {renderReplies(comment.replies, comment.id)}
                </div>
            ))}
        </div>
    );
}


