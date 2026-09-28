import About from '../components/About';
import Skills from '../components/Skills';

function Home({ bio, skillList }) {
  return (
    <>
      <About bio={bio} />
      <Skills skillList={skillList} />
    </>
  );
}

export default Home;
