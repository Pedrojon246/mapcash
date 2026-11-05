import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { TopicIcon } from '@/components/investments/topic-icon'
import { ALL_TOPICS, getTopic, DISCLAIMER, RISK_LABEL } from '@/lib/investments/content'

export function generateStaticParams() {
  return ALL_TOPICS.map(t => ({ slug: t.slug }))
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopic(params.slug)
  if (!topic) notFound()

  const idx = ALL_TOPICS.filter(t => t.kind === topic.kind).findIndex(t => t.slug === topic.slug)
  const sameKind = ALL_TOPICS.filter(t => t.kind === topic.kind)
  const next = sameKind[(idx + 1) % sameKind.length]

  const facts: [string, string][] = topic.kind === 'produto'
    ? [
        ['Risco', RISK_LABEL[topic.risk!]],
        ['Liquidez', topic.liquidity!],
        ['Mínimo', topic.minimum!],
        ['Proteção', topic.protection!],
      ]
    : []

  return (
    <div className="animate-fade-in safe-top pb-8">
      <PageHeader title={topic.title} back />
      <div className="px-5 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="icon-tile"><TopicIcon name={topic.icon} /></div>
          <p className="text-[15px] text-muted-foreground leading-snug">{topic.summary}</p>
        </div>

        {facts.length > 0 && (
          <div className="list-group">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 px-4 py-3.5">
                <span className="text-[13px] text-muted-foreground flex-shrink-0">{k}</span>
                <span className="text-[14px] font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        )}

        {topic.forWhom && (
          <div className="glass-card rounded-[22px] p-4">
            <p className="section-label mb-1.5">Pra quem faz sentido</p>
            <p className="text-[14px] leading-relaxed">{topic.forWhom}</p>
          </div>
        )}

        {topic.sections.map(sec => (
          <div key={sec.heading} className="px-1">
            <p className="text-[17px] font-semibold tracking-tight mb-2">{sec.heading}</p>
            <div className="space-y-2.5">
              {sec.body.map((p, i) => (
                <p key={i} className="text-[14px] text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        ))}

        {topic.where && (
          <div className="glass-card rounded-[22px] p-4">
            <p className="section-label mb-2">Onde encontrar</p>
            <ul className="space-y-1.5">
              {topic.where.map(w => (
                <li key={w} className="text-[14px] flex items-start gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-1 flex-shrink-0" /> {w}
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">
              Compare taxas, facilidade do app e se a instituição é autorizada pelo Banco Central ou pela CVM antes de abrir conta.
            </p>
          </div>
        )}

        <Link href="/investments/simulator" className="flex items-center justify-between glass-card rounded-[22px] p-4 pressable">
          <span className="text-[14px] font-semibold">Simular quanto isso rende</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>

        {next && next.slug !== topic.slug && (
          <Link href={`/investments/learn/${next.slug}`} className="flex items-center justify-between rounded-[22px] p-4 pressable bg-secondary">
            <span>
              <span className="block text-[11px] text-muted-foreground">{topic.kind === 'produto' ? 'Próximo produto' : 'Próxima lição'}</span>
              <span className="block text-[15px] font-semibold tracking-tight">{next.title}</span>
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        )}

        <p className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed pt-2">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
