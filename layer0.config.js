module.exports = {
  routes: './src/routes.ts',
  connector: '@layer0/starter',
  backends: {
    origin: {
      domainOrIp: 'www.monrovia.com',
      hostHeader: 'www.monrovia.com',
    },
  },
}
