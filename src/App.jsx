import { SkipLink } from './components/ui'
import { Hero } from './sections/Hero/Hero'

export default function App() {
  return (
    <>
      <SkipLink />
      <main id="main" tabIndex={-1}>
        <Hero />
      </main>
    </>
  )
}
