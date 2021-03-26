import "bootstrap/dist/css/bootstrap.css";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/layout";
import Command from "../components/Command";

export default function CommandPage() {
  return (
    <Layout>
      <Head>
        <title>Command</title>
      </Head>
      <h1>Command</h1>
      <Command/>      
    </Layout>
  );
}
