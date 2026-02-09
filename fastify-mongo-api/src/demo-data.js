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
  comments: [
    { postId: 1, id: 1, name: 'id labore ex et quam laborum', body: 'laudantium enim quasi est quidem magnam voluptate ipsam eos' },
  ],
  photos: [
    { albumId: 1, id: 1, title: 'accusamus beatae ad facilis cum similique qui sunt', url: 'http://localhost:3000/photos/1', thumbnailUrl: 'http://localhost:3000/photos/thumbs/1' },
    { albumId: 1, id: 2, title: 'reprehenderit est deserunt velit ipsam', url: 'http://localhost:3000/photos/2', thumbnailUrl: 'http://localhost:3000/photos/thumbs/2' },
  ],
};

module.exports = db;
