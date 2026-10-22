
const taskEvents = require('./events');


taskEvents.on('task-created', (task) => {
  console.log('[Notification] Handler started');

  setTimeout(() => {
    try {
      console.log('--- Task Notification ---');
      console.log('Task title:', task.title);
      console.log('Assigned user:', task.user);
      console.log('Timestamp:', new Date().toISOString());
      console.log('[Notification] Handler finished');
    } catch (err) {
      taskEvents.emit('error', err);
    }
  }, 2000);
});


taskEvents.on('task-deleted', (task) => {
  console.log(
    `[Notification] Task "${task.title}" was deleted at ${new Date().toISOString()}`
  );
});

taskEvents.on('error', (err) => {
  console.error('[Event Error]', err.message);
});

module.exports = taskEvents;
