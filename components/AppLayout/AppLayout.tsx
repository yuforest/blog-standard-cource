import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '../Logo';
import { useContext, useEffect } from 'react';
import PostsContext from '../../context/postContext';

export const AppLayout = ({ children, availableTokens, posts: postsFromSSR, postId, postCreated }) => {
  const { user } = useUser();

  const { setPostsFromSSR, posts, getPosts, noMorePosts } = useContext(PostsContext);

  useEffect(() => {
    setPostsFromSSR(postsFromSSR);
    if (postId) {
      const exists = postsFromSSR.find((p) => p._id === postId);
      if (!exists) {
        getPosts({ getNewerPosts: true, lastPostDate: postCreated });
      }
    }
  }, [setPostsFromSSR, postsFromSSR, postId, postCreated, getPosts]);

  return (
    <div className='grid grid-cols-[300px_1fr] h-screen max-h-screen'>
      <div className='flex flex-col text-white overflow-hidden'>
        <div className='bg-slate-800 px-2'>
          <Logo />
          <Link href='/posts/new' className='btn'>
            New post
          </Link>
          <Link href='/token-topup' className='block mt-2 text-center'>
            <FontAwesomeIcon icon={faCoins} className='text-yellow-500' />
            <span className='pl-1'>{availableTokens} tokens available</span>
          </Link>
        </div>
        <div className='px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800'>
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/posts/${post._id}`}
              className={`py-1 block border text-ellipsis overflow-hidden my-1 px-2  cursor-pointer rounded-sm ${
                postId === post._id ? 'bg-white/20 border-white' : 'border-white/0 bg-white/10'
              }`}
            >
              {post.topic}
            </Link>
          ))}
          {!noMorePosts && (
            <div
              onClick={() => getPosts({ lastPostDate: posts[posts.length - 1].created })}
              className='hover:underline text-sm text-slate-500 text-center cursor-pointer mt-4'
            >
              Load more posts
            </div>
          )}
        </div>
        <div className='bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2'>
          {!!user ? (
            <>
              <div className='min-w-[50px]'>
                <Image className='rounded-full' src={user.picture} alt={user.name} height={50} width={50} />
              </div>
              <div className='flex-1'>
                <div>{user.email}</div>
                <Link className='text-sm' href='/api/auth/logout'>
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link href='/api/auth/login'>Login</Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
