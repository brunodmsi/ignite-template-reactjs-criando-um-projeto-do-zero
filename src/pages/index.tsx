import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Início | spacetravelling</title>
      </Head>

      <Header />

      <main className={styles.container}>
        <a className={styles.post}>
          <article>
            <h1>Como utilizar hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida</p>

            <div className={styles.postInfo}>
              <time>
                <FiCalendar /> 15 Mar 2021
              </time>

              <span>
                <FiUser />
                Bruno De Masi
              </span>
            </div>
          </article>
        </a>
        <a className={styles.post}>
          <article>
            <h1>Como utilizar hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida</p>

            <div className={styles.postInfo}>
              <time>
                <FiCalendar /> 15 Mar 2021
              </time>

              <span>
                <FiUser />
                Bruno De Masi
              </span>
            </div>
          </article>
        </a>

        <button
          type="button"
          className={styles.loadMorePostsButton}
          onClick={() => console.log()}
        >
          Carregar mais posts
        </button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  // const postsResponse = await prismic.query();

  return {
    props: {},
  };
};
