import 'bootstrap/dist/css/bootstrap.css';

import { useRouter } from 'next/router'

const RunCmd = () => {
  const router = useRouter()
  const { cmd } = router.query

  return <p>Command: {cmd}</p>
}

export default RunCmd

// export default function RunCmd(props) {
//     return (
//         <div>
//         {props.files.map((f, idx) => {
//            return (<div key={idx} >
//             <img src={`/images/${f.type}.png`} width='16'/>&nbsp;
//             <span>{f.name}</span>
//             </div>)
//          })}
//         </div>
//       );
// } 

export async function getStaticProps() {
    const router = useRouter()
    const { cmd } = router.query
    console.log(cmd);
    const res = await fetch('/api/run/' + cmd)
    const js = await res.json()
    const stdout = js.stdout;
    const stderr = js.stderr;
    return {
      props: {
        stdout: stdout,
        stderr: stderr
      },
    }
  }
export async function getStaticPaths() {
return {
    paths: [],
    fallback: false
};
}
  