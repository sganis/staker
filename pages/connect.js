import "bootstrap/dist/css/bootstrap.css";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/layout";
import FormHost from "../components/FormHost";

export default function ConnectHostPage() {
  return (
    <Layout>
      <Head>
        <title>Connect</title>
      </Head>
      <h1>Connect</h1>
      <FormHost/>      
    </Layout>
  );
}
