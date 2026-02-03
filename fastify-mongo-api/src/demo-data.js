// In-memory data store for the demo backend

const db = {
  posts: [
    { userId: 1, id: 1, title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit', body: 'quia et suscipit...' },
    { userId: 1, id: 2, title: 'qui est esse', body: 'est rerum tempore vitae...' },
  ],
  users: [
    { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
    { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
  ],
  todos: [
    { userId: 1, id: 1, title: 'delectus aut autem', completed: false },
  ],
  albums: [
    { userId: 1, id: 1, title: 'quidem molestiae enim' },
    { userId: 1, id: 2, title: 'sunt qui excepturi placeat culpa' },
  ],
};

module.exports = db;
