import React, {useState} from 'react';
import { useRouter } from 'next/router'

const STATUS = {
    IDLE : "IDLE",
    SUBMITTED: "SUBMITTED",
    SUBMITTING: "SUBMITTING",
    COMPLETED: "COMPLETED",
}

const Command = () => {
  // const router = useRouter()
  const [result, setResult] = useState('');
  const [cmd, setCmd] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(STATUS.IDLE);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus(STATUS.SUBMITTING);
    const res = await fetch('/api/command',
    {
        body: JSON.stringify({
          cmd: e.target.cmd.value
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
    })

    let r = await res.json();
    console.log(r.stdout);
    setResult(r);
    setLoading(false);
    setStatus(STATUS.COMPLETED);
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
    <div className="form-group">
        <label htmlFor="cmd">Command:</label>        
        <input className="form-control" id="cmd" type="text" name="cmd"
         placeholder="command..."  autoComplete="cmd" required 
         value={cmd} onChange={(e)=> setCmd(e.target.value)}/>
    </div>
    <input type="submit"
         className="btn btn-primary"
         value="Run"
         disabled={status === STATUS.SUBMITTING}
         />
    </form>
    <br/>
    <p>
        { loading
        ? <span>Loading...</span>
        : result && !result.stderr 
            ? result.stdout.split('\n').map((item, key) => {
                    return <span key={key}>{item}<br/></span>
                })
            : <span>Error: {result.stderr}</span>}
    </p>
    </>
  )
}

export default Command;

