import Header from '../components/Header'
import Body from '../components/Body'
import Footer from '../components/Footer'
import 'bootstrap/dist/css/bootstrap.css';
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'

export default function Index() {
    return (
        <Layout>
          <Head>
            <title>Home</title>
          </Head>
          <h1>Staker</h1>
          <h2>
            <Link href="/command">
              <a>Run</a>
            </Link>
          </h2>
          <h2>
            <Link href="/connect">
              <a>Connect</a>
            </Link>
          </h2>
        </Layout>
      )
}

