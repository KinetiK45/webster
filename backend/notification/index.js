const {listenForUserRegistrationEvents, listenForUserLoginEvents, listenForUserResetEvents} = require("./service/rabbitService");

listenForUserRegistrationEvents().catch((error) => {
    console.error('Error starting listener registration:', error);
});

listenForUserLoginEvents().catch((error) => {
    console.error('Error starting listener login:', error);
});

listenForUserResetEvents().catch((error) => {
    console.error('Error starting listener login:', error);
});
