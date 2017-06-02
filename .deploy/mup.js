module.exports = {
  servers: {
    one: {
      host: '35.162.10.194',
      username: 'ubuntu',
      pem: '~/Keys/MacBook.pem'
    }
  },

  meteor: {
    dockerImage: 'abernix/meteord:base',
    name: 'sole',
    path: '/Users/smokey/Projects/Saltea/Apps/sole/',
    servers: {
      one: {}
    },
    buildOptions: {
      debug: true,
      serverOnly: true
    },
    env: {
      ROOT_URL: 'sole.saltea.co',
      MONGO_URL: 'mongodb://localhost/meteor'
    },

    //dockerImage: 'kadirahq/meteord'
    deployCheckWaitTime: 150
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
