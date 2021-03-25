import { useRouter } from 'next/router'
import 'bootstrap/dist/css/bootstrap.css';

const Run = () => {
  const router = useRouter()
  const { cmd } = router.query

  return <p>Command: {cmd}</p>
}

export default Run

