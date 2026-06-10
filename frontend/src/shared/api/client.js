import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080' })

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  cfg.headers['X-Correlation-Id'] = crypto.randomUUID()
  return cfg
})

api.interceptors.response.use((r) => r, async (err) => {
  if (err?.response?.status === 401 && localStorage.getItem('refreshToken')) {
    const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: localStorage.getItem('refreshToken') })
    localStorage.setItem('accessToken', data.accessToken)
    err.config.headers.Authorization = `Bearer ${data.accessToken}`
    return api.request(err.config)
  }
  throw err
})
