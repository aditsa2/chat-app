const generateMessage = (text,username) => {
    return {
        usernameFromServer:username,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}