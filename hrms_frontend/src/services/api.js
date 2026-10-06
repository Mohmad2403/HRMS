//console.log('API URL:', import.meta.env.VITE_API_URL)
import axios from 'axios'

import zxiox from 'axios'
const api =axios.create({
    baseURL:import.meta.env.VITE_API_URL,
})

//run before every request to fetch access token 
api.interceptors.request.use((config)=>{
    const token=localStorage.getItem('access')
    if (token){
        config.headers.Authorization=`Bearer ${token}`
    }
    return config
})


//run after every response if in case token expired or refresh it and try 
api.interceptors.response.use((response)=>response,
async(error)=>{
    const original =error.config
    const refresh =localStorage.getItem('refresh')

    const isLoginCall=original.url.includes('/auth/login/')

    if (error.response?.status==401 && refresh && !original._retry && !isLoginCall){
        try{
            const {data}=await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh/`,{refresh})
            localStorage.setItem('access',data.access)
            original.headers.Authorization=`Bearer ${data.access}`
            return api(original)
        }
        catch{
            localStorage.clear()
            window.location.href ='/login'
        }
    }
    return Promise.reject(error)
})

export default api