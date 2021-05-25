import { createRef, useEffect } from 'react';

export default function Comments(): JSX.Element {
  const commentBox = createRef<HTMLDivElement>();

  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', true);
    scriptEl.setAttribute(
      'repo',
      'brunodmsi/ignite-template-reactjs-criando-um-projeto-do-zero'
    );
    scriptEl.setAttribute('issue-term', 'pathname');
    scriptEl.setAttribute('theme', 'github-dark');

    commentBox.current.appendChild(scriptEl);
  }, [commentBox]);

  return (
    <div className="comment-box-wrapper">
      <div ref={commentBox} className="comment-box" />
    </div>
  );
}
