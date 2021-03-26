import React from 'react';
import { useRouter } from 'next/router'

const FormHost = () => {
  const router = useRouter()
    
  const handleSubmit = async e => {
    e.preventDefault()
    const res = await fetch('/api/connect_host',
    {
        body: JSON.stringify({
          name: e.target.host.value
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
    })

    const result = await res.json()
    console.log(result)
    router.push('/')
  }
  
  return (
    <form onSubmit={handleSubmit}>
    <div className="form-group">
        <label htmlFor="host">Host:</label>        
        <input className="form-control" id="host" type="text" name="host"
         placeholder="Host name or IP"  autoComplete="host" required />
    </div>
    <button type="submit" className="btn btn-primary">Connect</button>
    </form>
  )
}

export default FormHost;