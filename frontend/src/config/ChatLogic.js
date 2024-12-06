const getSender = (loggedUser, users) => {
    return loggedUser.data.user._id == users[0]._id ? users[1].name : users[0].name;
};


const getSenderFull = (loggedUser, users) => {
    return loggedUser.data.user._id === users[0]._id ? users[1] : users[0];
};


// returns true if current and next message sender are same or not (except me)
const isSameSender = (messages, currMessage, index, userId) => {
    return (
        (index < messages.length - 1) && (
            (
                (messages[index + 1].sender._id !== currMessage.sender._id) ||    // if current message and next message sender are different
                (messages[index + 1].sender._id !== undefined)                        // if next message sender is not undefined
            ) && (messages[index].sender._id !== userId)                           // if current message sender is not me
        )
    )
};


// returns true, for a particular sender current message is his/her last message or not( except me )
const isLastMessage = (messages, index, userId) => {
    return (
        index === messages.length - 1 &&
        messages[messages.length - 1].sender._id !== userId &&
        messages[messages.length - 1].sender._id
    )
};

const setSenderMargin = (messages, currMessage, index, userId) => {
    if ((index < messages.length - 1) && (
        ((messages[index + 1].sender._id === currMessage.sender._id) &&
            (messages[index].sender._id !== userId)
        ))) return 33;

    else if (
        ((index < messages.length - 1) &&
            (messages[index + 1].sender._id !== currMessage.sender._id) &&
            (messages[index].sender._id !== userId)) ||
        (index === messages.length - 1 && messages[index].sender._id !== userId)
    ) return 0;

    else return "auto"
}

const isSameUser = (messages, currMessage, index) => {
    return (index > 0) && (messages[index - 1].sender._id === currMessage.sender._id)
}



export {
    getSender,
    getSenderFull,
    isSameSender,
    isLastMessage,
    setSenderMargin,
    isSameUser
}