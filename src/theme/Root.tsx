import {useRef, type ReactNode} from 'react'

import AivoryPageMotion from '../components/aivory-page-motion'
import ExperienceTransition from '../components/experience-transition'

type RootProps = {
  children: ReactNode
}

export default function Root({children}: RootProps): ReactNode {
  const scopeRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={scopeRef} className="aivory-motion-scope">
      <AivoryPageMotion scopeRef={scopeRef} />
      <ExperienceTransition />
      {children}
    </div>
  )
}
