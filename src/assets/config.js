export default {
  server: process.env.VUE_APP_SERVER,
  fileServer: process.env.VUE_APP_FILE_SERVER,
  credentials: { user: 'admin', key: 'root' },
  database: process.env.VUE_APP_DB
}
