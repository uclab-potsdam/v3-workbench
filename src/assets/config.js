const user = localStorage.getItem('USER') || 'admin'
const key = localStorage.getItem('KEY') || localStorage.getItem('JWT') ? undefined : 'root'
const jwt = localStorage.getItem('JWT') || undefined
const organization = localStorage.getItem('ORGANIZATION') || user

export default {
  server: process.env.VUE_APP_SERVER,
  fileServer: process.env.VUE_APP_FILE_SERVER,
  credentials: {
    user,
    key,
    jwt,
    organization
  },
  database: process.env.VUE_APP_DB
}
