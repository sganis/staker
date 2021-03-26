import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function Command() {
  const { data,error } = useSWR('/api/run/dir', fetcher)
  console.log(data);
  if (error) return <div>error: {error}</div>
  if (!data) return <div>loading...</div>
  return <div>hello {data.stdout}!</div>
}

export default Command