import Link from '@docusaurus/Link'
import styles from '../pages/experience.module.css'

type Chapter = 'home' | 'product' | 'architecture'

export default function ExperienceNav({current, isEnglish}: {current: Chapter; isEnglish: boolean}) {
  const chapters = [
    {id: 'home', to: '/', title: isEnglish ? 'Begin here' : '从这里开始', detail: isEnglish ? 'Documentation & deployment' : '文档与部署'},
    {id: 'product', to: '/product', title: isEnglish ? 'Inside Aivory' : '走进 Aivory', detail: isEnglish ? 'The product workspace' : '产品工作空间'},
    {id: 'architecture', to: '/architecture', title: isEnglish ? 'Under the surface' : '理解内部架构', detail: isEnglish ? 'Follow a request' : '沿着请求，探索系统'},
  ]
  return <nav className={styles.chapterNav} aria-label={isEnglish ? 'Explore Aivory chapters' : '探索 Aivory 章节'}>
    {chapters.map((chapter, index) => <Link to={chapter.to} key={chapter.id} aria-current={current === chapter.id ? 'page' : undefined}>
      <span className={styles.chapterNumber}>0{index + 1}</span>
      <span><strong>{chapter.title}</strong><small>{chapter.detail}</small></span>
      <span className={styles.chapterArrow} aria-hidden="true">{current === chapter.id ? '•' : '↗'}</span>
    </Link>)}
  </nav>
}
