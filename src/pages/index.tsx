import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handleMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(jsonData => {
        const newPosts = jsonData.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
          };
        });

        setPosts(oldPosts => [...oldPosts, ...newPosts]);
        setNextPage(jsonData.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Início | spacetravelling</title>
      </Head>

      <Header />

      <main className={`${styles.container} ${commonStyles.container}`}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.post}>
              <article>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div className={styles.postInfo}>
                  <time>
                    <FiCalendar />{' '}
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>

                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </article>
            </a>
          </Link>
        ))}

        {postsPagination.next_page && (
          <button
            type="button"
            className={styles.loadMorePostsButton}
            onClick={handleMorePosts}
          >
            Carregar mais posts
          </button>
        )}

        {preview && (
          <aside className={commonStyles.previewModeButton}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 5,
      page: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
    first_publication_date: post.first_publication_date,
  }));

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
      preview: preview ?? null,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
