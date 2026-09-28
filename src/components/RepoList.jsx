function RepoList({ data }) {
  if (data.length === 0) return <p>No repositories found.</p>;

  return (
    <ul className="repo-list">
      {data.map((r) => (
        <li key={r.id}>
          <a href={r.html_url} target="_blank" rel="noreferrer">
            {r.name}
          </a>
          <span className="stars">&#9733; {r.stargazers_count}</span>
          <div className="muted">{r.html_url}</div>
        </li>
      ))}
    </ul>
  );
}

export default RepoList;
