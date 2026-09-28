const projects = [
  { title: 'MediConnect', description: 'Healthcare platform with patient authentication.' },
  { title: 'SecureIDS', description: 'Network intrusion detection system dashboard.' },
  { title: 'Portfolio Site', description: 'Personal portfolio built with React and Vite.' },
];

function Projects() {
  return (
    <section id="projects" className="section">
      <h2>Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.title}>
            <strong>{p.title}</strong>: {p.description}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Projects;