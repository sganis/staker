import 'bootstrap/dist/css/bootstrap.css';

export default function Files(props) {
    return (
        <div>
        {props.files.map((f, idx) => {
           return (<div key={idx} >
            <img src={`/images/${f.type}.png`} width='16'/>&nbsp;
            <span>{f.name}</span>
            </div>)
         })}
        </div>
      );
    //return  (
        //return <div>Next stars: {props.files}</div>;
        // <div class="container">
        //     {props.files.map(i => {
        //         return {i.name} + "&nbsp;"+ {i.name} <br/>`});
        //     })}
        // </div>
    //);
} 

export async function getStaticProps() {
    const res = await fetch('/api/data')
    const files = await res.json()
    // const files = [
    //     {name : 'server.txt', type: 'file' },
    //     {name : 'server2.txt', type: 'file' }
    //   ];
    return {
      props: {
        files,
      },
    }
  }
