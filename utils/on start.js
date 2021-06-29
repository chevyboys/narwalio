u = require('./utils');
const colors = require('colors');


let exporter = {
    onStart: async (client) => {
        u.log('Ready!'.blue, client);
        u.updateScheduledEvents(client);
        u.initiateUtilsClient(client);
    }

}
module.exports = exporter;
//ToDo: set up has command