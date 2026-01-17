import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import '../Styling/commentSectionTwo.css';

export default function CommentSection({ projID }) {
    // State for storing comments
    const [comments, setComments] = useState([]);
    const commentSectionReference = useRef(null);
    const [username, setUsername] = useState('');
    const [idNumber, setIdNumber] = useState(0);
    const [existingComments, setOldComments] = useState([]);

    async function getProjectComments(id) {
        try {
            const response = await axios.post('/api/getProjectComments', { projID: id });
            
            const nestedComments = buildCommentTree(response.data);
            
            setOldComments(nestedComments);
        } catch (error) {
            console.log("Comment Error: " + error);
        }
    }

    useEffect(() => {
        if (projID && projID.startsWith("id")) {
            let id = parseInt(projID.replace("id", ""));
            setIdNumber(id);
            
            // Get the username from session storage to use for new comments
            const storedUser = sessionStorage.getItem('account');
            setUsername(storedUser || "Guest"); // Default to Guest if missing
            
            getProjectComments(id);
        }
    }, [projID]);


    // Helper to turn flat DB rows into nested React comments
    function buildCommentTree(flatComments) {
        const commentMap = {};
        const roots = [];

        flatComments.forEach(c => {
            const id = c.commentid || c.id;
            commentMap[id] = { ...c, id: id, replies: [] }; 
        });

        flatComments.forEach(c => {
            const id = c.commentid || c.id;
            const parentId = c.parentid;

            if (parentId && parentId !== 0) {
                // If it has a parent, add it to the parent's replies
                if (commentMap[parentId]) {
                    commentMap[parentId].replies.push(commentMap[id]);
                }
            } else {
                roots.push(commentMap[id]);
            }
        });

        return roots;
    }

    const addComment = (message) => {
        const newComment = {
            id: comments.length + 1, 
            user: username,
            message: message,
            replies: [], 
            showReplyBox: false 
        };

        setComments([...comments, newComment]);
        pushComments(message);

        if (commentSectionReference.current) {
            commentSectionReference.current.style.overflowY = 'scroll';
        }
    };

   async function pushComments(message, parentId = 0) {
    let key = sessionStorage.getItem('key');
    try {
        await axios.post('/api/createComment', {
            username: username, 
            password: key, 
            projID: Number(idNumber), 
            comment: message,
            parentID: parentId
        });
    } catch (error) {
        console.log("Comment Error: " + error);
    }
}

    const toggleReplyBox = (targetId) => {
        const updatedLocal = comments.map(c => {
            if (c.id === targetId) return { ...c, showReplyBox: !c.showReplyBox };
            return { ...c, showReplyBox: false }; // Close others
        });
        setComments(updatedLocal);

        const updatedOld = existingComments.map(c => {
            const currentId = c.id || c.commentid; 
            if (currentId === targetId) {
                return { ...c, showReplyBox: !c.showReplyBox };
            }
            return { ...c, showReplyBox: false }; // Close others
        });
        setOldComments(updatedOld);
    };

    const addReply = (parentId, replyMessage) => {
        const addReplyToNode = (list) => {
            return list.map(comment => {
                const currentId = comment.id || comment.commentid;

                if (currentId === parentId) {
                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            {
                                id: Date.now(), // Temporary unique ID
                                username: username,
                                message: replyMessage,
                                showReplyBox: false
                            }
                        ],
                        showReplyBox: false
                    };
                }
                
                if (comment.replies) {
                    return { ...comment, replies: addReplyToNode(comment.replies) };
                }
                return comment;
            });
        };

        setComments(addReplyToNode(comments));
        setOldComments(addReplyToNode(existingComments));

        pushComments(replyMessage, parentId);
    };

    const renderReplies = (replies) => {
        if (!replies) return null;

        return replies.map(reply => (
            <div key={reply.id} className="reply">
                <p className="reply-username" style={{fontWeight:'bold'}}>{reply.username}</p>
                
                <div className="reply-message">
                    <p>{reply.message || reply.content}</p>
                </div>
                
                <div className="like-reply-section">
                     {/* Can add back the Reply button logic here if needed for nested replies */}
                </div>

                {renderReplies(reply.replies)}
            </div>
        ));
    };

    return (
        <div ref={commentSectionReference} className="comment-section">
            <h2>Comments</h2>

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


            {[...comments, ...existingComments].map(comment => {
                const reliableID = comment.id || comment.commentid;

                return (
                    <div key={reliableID} className="comment">
                        <p className="comment-username" style={{fontWeight:'bold'}}>
                            {comment.user || comment.username || "Anonymous"}
                        </p>
                        <div className="comment-body">
                            <div className="comment-message">
                                <p className="message-text">{comment.message || comment.content}</p>
                                <img src={"./images/robot_new.jpg"} alt="Profile" className="profile-picture" />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="like-reply-section">
                            {!comment.isReply && (
                                <button className="reply-button" onClick={() => toggleReplyBox(reliableID)}>
                                    {comment.showReplyBox ? "Cancel" : "Reply"}
                                </button>
                            )}
                        </div>

                        {comment.showReplyBox && (
                            <div className="reply-box-container">
                                <input 
                                    id={`reply-input-${reliableID}`}
                                    type="text" 
                                    placeholder="Reply..." 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                            addReply(reliableID, e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="reply-input reply-input-expanded" 
                                    autoFocus
                                />
                                
                                <button 
                                    className="reply-send-btn"
                                    onClick={() => {
                                        const input = document.getElementById(`reply-input-${reliableID}`);
                                        if (input && input.value.trim() !== '') {
                                            addReply(reliableID, input.value);
                                            input.value = ''; 
                                        }
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                        )}
                        {renderReplies(comment.replies)}
                    </div>
                );
            })}
        </div>
    );
}