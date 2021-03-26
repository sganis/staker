import { useRouter } from 'next/router'

const RunCmd = (props) => {
  const router = useRouter()
  const cmd = router.query.cmd || []
  console.log(cmd)
  console.log(props)
  
  return (
    <>
      <h1>Command: {cmd.join('/')}</h1>
      <p>Output: {props.stdout}</p>
      <p>Error: {props.stderr}</p>
    </>
  );
}

export default RunCmd

export async function getServerSideProps(context) {
    console.log(context.params);
    let {cmd} = context.params;

    console.log(cmd);
    let url = 'http://localhost:3000/api/run/' + cmd.join('/');
    console.log(url)
    const res = await fetch(url);
    const js = await res.json();
    
    return {
      props: {
        stdout: js.stdout,
        stderr: js.stderr
      },
    }
  }

  