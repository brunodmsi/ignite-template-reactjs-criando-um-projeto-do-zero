import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import Comments from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  next_post: {
    uid: string;
    title: string;
  };
  prev_post: {
    uid: string;
    title: string;
  };
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const totalTime = post.data.content.reduce((acc, time) => {
    const total = RichText.asText(time.body).split(' ');

    const min = Math.ceil(total.length / 200);
    return acc + min;
  }, 0);

  return (
    <>
      <Head>
        <title>Post | spacetravelling</title>
      </Head>

      <Header />

      <img src={post.data.banner.url} alt="banner" className={styles.banner} />

      <main className={`${styles.container} ${commonStyles.container}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfo}>
          <div className={styles.mainPostInfo}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock /> {totalTime} min
            </span>
          </div>

          {post.first_publication_date !== post.last_publication_date && (
            <span className={styles.lastEditedInfo}>
              <i>
                * editado em{' '}
                {format(
                  new Date(post.last_publication_date),
                  "dd MMM yyyy', às ' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </i>
            </span>
          )}
        </div>

        <article className={styles.postContent}>
          {post.data.content.map(p => (
            <div key={p.heading}>
              <h3>{p.heading}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(p.body) }}
              />
            </div>
          ))}
        </article>

        <div className={styles.navigationBetweenPosts}>
          {post.prev_post?.uid !== undefined ? (
            <Link href={`/post/${post.prev_post?.uid}`}>
              <a>
                {post.prev_post?.title} <span>Post anterior</span>
              </a>
            </Link>
          ) : (
            <div />
          )}
          {post.next_post?.uid !== undefined ? (
            <Link href={`/post/${post.next_post?.uid}`}>
              <a>
                {post.next_post?.title} <span>Próximo post</span>
              </a>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <Comments />

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

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: `${response.uid}`,
      orderings: '[document.first_publication_date desc]',
    }
  );
  const prevPostResults = {
    uid: prevPost?.results[0].uid,
    title: prevPost?.results[0].data.title,
  };

  const nextPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: `${response.uid}`,
      orderings: '[document.first_publication_date]',
    }
  );
  const nextPostResults = {
    uid: nextPost?.results[0].uid,
    title: nextPost?.results[0].data.title,
  };

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    prev_post: prevPostResults.uid !== response.uid ? prevPostResults : null,
    next_post: nextPostResults.uid !== response.uid ? nextPostResults : null,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      preview: preview ?? null,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
