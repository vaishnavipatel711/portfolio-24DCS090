import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import RepoList from '../components/RepoList';

const GITHUB_USERNAME = 'vaishnavipatel711';

// Practical 1 assignment: hardcoded list of projects
const projects = [
  { title: 'MediConnect', description: 'Healthcare platform with patient authentication.' },
  { title: 'SecureIDS', description: 'Network intrusion detection system dashboard.' },
  { title: 'Portfolio Site', description: 'Personal portfolio built with React and Vite.' },
];

function Projects() {
  // Practical 3: three state variables for async data
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [attempt, setAttempt] = useState(0); // bump to re-run the fetch (retry)

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
        // fetch() does NOT throw on 404/403, so we must check res.ok ourselves
        if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRepos(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true; // ignore results if the component unmounts / re-runs
    };
  }, [attempt]);

  const filtered = repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="section">
      <h2>Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.title}>
            <strong>{p.title}</strong>: {p.description}
          </li>
        ))}
      </ul>

      <h2>My GitHub Repositories</h2>
      {loading && <Spinner label="Fetching repositories..." />}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={() => setAttempt((a) => a + 1)} />
      )}
      {!loading && !error && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories by name"
          />
          <RepoList data={filtered} />
        </>
      )}
    </section>
  );
}

export default Projects;
