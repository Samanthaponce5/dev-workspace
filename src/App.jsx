import { Footer } from './components/layout/Footer'
import { Nav } from './components/layout/Nav'
import { DisplaySettings } from './components/settings/DisplaySettings'
import { SkipLink } from './components/ui'
import { About } from './sections/About/About'
import { Contact } from './sections/Contact/Contact'
import { Experience } from './sections/Experience/Experience'
import { Hero } from './sections/Hero/Hero'
import { Work } from './sections/Work/Work'

export default function App() {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Work />
        <About />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <DisplaySettings />
    </>
  )
}
