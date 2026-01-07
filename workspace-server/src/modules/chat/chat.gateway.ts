// Chat Gateway Placeholder
export const setupChatGateway = (io: any) => {
    io.on('connection', (socket: any) => {
        console.log('User connected to chat');
    });
};
