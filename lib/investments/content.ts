export type Level = 1 | 2 | 3

export interface Topic {
  slug: string
  kind: 'produto' | 'licao'
  title: string
  summary: string
  icon: string // lucide icon key, resolved in the UI
  // produtos only
  risk?: Level
  liquidity?: string
  minimum?: string
  protection?: string
  forWhom?: string
  where?: string[]
  // shared
  sections: { heading: string; body: string[] }[]
}

export const RISK_LABEL: Record<Level, string> = { 1: 'Baixo', 2: 'Médio', 3: 'Alto' }

export const DISCLAIMER =
  'Conteúdo educativo. Não é recomendação de investimento. Regras, taxas e impostos mudam: confira sempre a condição vigente antes de aplicar.'

export const PRODUCTS: Topic[] = [
  {
    slug: 'tesouro-direto',
    kind: 'produto',
    title: 'Tesouro Direto',
    summary: 'Você empresta dinheiro ao governo federal e recebe juros.',
    icon: 'landmark',
    risk: 1,
    liquidity: 'Tesouro Selic: resgate no dia útil seguinte',
    minimum: 'A partir de cerca de R$ 30',
    protection: 'Garantido pelo Tesouro Nacional (não usa FGC)',
    forWhom: 'Quem quer começar com segurança, inclusive para a reserva de emergência.',
    where: ['Site e app do Tesouro Direto', 'Corretoras e bancos que oferecem Tesouro Direto'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'Quando você compra um título, está emprestando dinheiro ao governo. Em troca, ele paga juros de acordo com o tipo de título.',
          'O Tesouro Selic acompanha a taxa Selic e é o mais usado para reserva de emergência. O Tesouro Prefixado trava a taxa na compra. O Tesouro IPCA+ paga a inflação mais uma taxa fixa.',
        ],
      },
      {
        heading: 'Cuidados',
        body: [
          'Títulos prefixados e IPCA+ podem render menos (ou até dar prejuízo) se você vender antes do vencimento, porque o preço oscila.',
          'Há imposto de renda regressivo sobre o rendimento (a alíquota cai conforme o prazo) e uma taxa de custódia da B3 que pode ter isenção em alguns casos. Confira as regras atuais.',
        ],
      },
      {
        heading: 'Como comparar onde comprar',
        body: [
          'O título é o mesmo em qualquer lugar. O que muda é a taxa que a corretora ou o banco cobra, se cobra, e a facilidade do app. Compare custos antes de abrir conta.',
        ],
      },
    ],
  },
  {
    slug: 'cdb',
    kind: 'produto',
    title: 'CDB',
    summary: 'Você empresta dinheiro a um banco e ele devolve com juros.',
    icon: 'badge',
    risk: 1,
    liquidity: 'Pode ser diária ou só no vencimento',
    minimum: 'Varia, muitos a partir de R$ 1 a R$ 100',
    protection: 'FGC cobre até R$ 250 mil por CPF por instituição',
    forWhom: 'Quem quer rendimento previsível e aceita escolher o banco com cuidado.',
    where: ['Bancos (inclusive digitais)', 'Corretoras que vendem CDB de vários bancos'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'O CDB é um título de dívida do banco. Ele costuma render uma porcentagem do CDI, como 100% do CDI, ou uma taxa prefixada.',
          'Para reserva de emergência, procure CDB com liquidez diária. Quem não precisa do dinheiro logo pode aceitar prazo maior em troca de taxa melhor.',
        ],
      },
      {
        heading: 'Cuidados',
        body: [
          'A cobertura do FGC tem limite. Dividir valores grandes entre instituições diferentes reduz o risco.',
          'Bancos menores costumam pagar mais, e isso reflete risco maior. Taxa muito acima do mercado merece desconfiança.',
          'Há imposto de renda regressivo sobre o rendimento, e IOF se você resgatar nos primeiros 30 dias.',
        ],
      },
    ],
  },
  {
    slug: 'lci-lca',
    kind: 'produto',
    title: 'LCI e LCA',
    summary: 'Letras de crédito ligadas ao setor imobiliário e ao agronegócio.',
    icon: 'home',
    risk: 1,
    liquidity: 'Costuma ter carência: confira o prazo antes',
    minimum: 'Varia por emissor',
    protection: 'FGC cobre até R$ 250 mil por CPF por instituição',
    forWhom: 'Quem consegue deixar o dinheiro parado por um tempo e quer comparar com CDB.',
    where: ['Bancos', 'Corretoras'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'São parecidas com o CDB, mas o dinheiro financia crédito imobiliário (LCI) ou do agronegócio (LCA).',
          'Historicamente, o rendimento é isento de imposto de renda para pessoa física. Essa regra pode mudar, então confira a vigente antes de comparar.',
        ],
      },
      {
        heading: 'Como comparar com o CDB',
        body: [
          'Um CDB que paga 100% do CDI com imposto pode render menos que uma LCI com percentual menor, mas sem imposto. Compare sempre o valor líquido, depois do imposto.',
        ],
      },
    ],
  },
  {
    slug: 'poupanca',
    kind: 'produto',
    title: 'Poupança',
    summary: 'A conta mais conhecida do Brasil, com rendimento definido por lei.',
    icon: 'piggy',
    risk: 1,
    liquidity: 'Diária (o rendimento sai no aniversário mensal)',
    minimum: 'Qualquer valor',
    protection: 'FGC cobre até R$ 250 mil por CPF por instituição',
    forWhom: 'Quem quer simplicidade total e não se importa em render menos.',
    where: ['Qualquer banco'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'Quando a Selic está acima de 8,5% ao ano, a poupança rende 0,5% ao mês mais a TR. Quando está abaixo, rende 70% da Selic mais a TR.',
          'Não tem imposto de renda sobre o rendimento e você saca quando quiser.',
        ],
      },
      {
        heading: 'Vale a pena?',
        body: [
          'Em geral, a poupança rende menos que Tesouro Selic e CDB com liquidez diária, que também são seguros. A diferença aparece com o tempo. Use o simulador para ver quanto você deixa de ganhar.',
        ],
      },
    ],
  },
  {
    slug: 'fundos',
    kind: 'produto',
    title: 'Fundos de investimento',
    summary: 'Você junta dinheiro com outras pessoas e um gestor investe por todos.',
    icon: 'layers',
    risk: 2,
    liquidity: 'Varia: de D+0 a vários dias, ou meses em alguns',
    minimum: 'Varia: muitos a partir de R$ 100 a R$ 1.000',
    protection: 'Sem FGC. Depende dos ativos do fundo',
    forWhom: 'Quem prefere delegar a escolha dos ativos e aceita pagar taxas por isso.',
    where: ['Corretoras', 'Bancos', 'Plataformas de investimento'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'Existem fundos de renda fixa, multimercado, ações e outros. Cada um segue uma política de investimento descrita no regulamento.',
          'Você compra cotas, e o valor da cota varia conforme os ativos do fundo.',
        ],
      },
      {
        heading: 'O que olhar antes',
        body: [
          'Taxa de administração e de performance: taxas altas corroem o resultado ao longo dos anos.',
          'Prazo de resgate, o tipo de ativo em que o fundo investe e o histórico de oscilação.',
          'Fundos de renda fixa e multimercado costumam ter "come-cotas", uma antecipação de imposto cobrada em maio e novembro.',
        ],
      },
    ],
  },
  {
    slug: 'fiis',
    kind: 'produto',
    title: 'Fundos imobiliários (FIIs)',
    summary: 'Você compra cotas de fundos que investem em imóveis ou títulos do setor.',
    icon: 'building',
    risk: 2,
    liquidity: 'Vende na bolsa em dias de pregão, pelo preço do momento',
    minimum: 'O preço de uma cota (muitas por volta de R$ 10 a R$ 100)',
    protection: 'Sem FGC. O valor da cota oscila',
    forWhom: 'Quem busca renda mensal e já tem reserva de emergência pronta.',
    where: ['Corretoras (compra pela bolsa)'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'Os FIIs distribuem rendimentos periodicamente, em geral todo mês, vindos de aluguéis ou juros de títulos imobiliários.',
          'As cotas são negociadas na bolsa, então o preço sobe e desce todos os dias, mesmo que o fundo continue pagando.',
        ],
      },
      {
        heading: 'Cuidados',
        body: [
          'Rendimento passado não garante o futuro. Há fundos de tijolo (imóveis) e de papel (títulos), com riscos diferentes.',
          'Concentrar tudo em um só fundo aumenta o risco. As regras de imposto têm particularidades, então confira as vigentes.',
        ],
      },
    ],
  },
  {
    slug: 'acoes',
    kind: 'produto',
    title: 'Ações',
    summary: 'Você vira sócio de uma empresa, mesmo que de uma fatia pequena.',
    icon: 'chart',
    risk: 3,
    liquidity: 'Vende na bolsa em dias de pregão, pelo preço do momento',
    minimum: 'O preço de uma ação, ou fração dela em algumas corretoras',
    protection: 'Sem garantia. Pode perder parte ou todo o valor',
    forWhom: 'Quem pensa em muitos anos, já tem reserva e aguenta ver o saldo cair sem vender no susto.',
    where: ['Corretoras (compra pela bolsa)'],
    sections: [
      {
        heading: 'Como funciona',
        body: [
          'O ganho vem da valorização da ação e dos dividendos que algumas empresas distribuem.',
          'O preço varia todos os dias por notícias, resultados da empresa e humor do mercado.',
        ],
      },
      {
        heading: 'Antes de começar',
        body: [
          'Só invista em ações dinheiro que você não vai precisar nos próximos anos.',
          'Estudar a empresa e diversificar reduz risco. Evitar decisões por impulso também.',
          'Compare as corretoras: corretagem, taxas de custódia e a qualidade do app.',
        ],
      },
    ],
  },
]

export const LESSONS: Topic[] = [
  {
    slug: 'o-que-e-cdi',
    kind: 'licao',
    title: 'O que é CDI?',
    summary: 'A taxa que serve de régua para a renda fixa.',
    icon: 'percent',
    sections: [
      {
        heading: 'Em 2 minutos',
        body: [
          'CDI é a taxa que os bancos cobram entre si em empréstimos de curtíssimo prazo. Ela anda quase colada na Selic.',
          'Quando um CDB paga "100% do CDI", ele rende o mesmo que essa taxa. Se paga 110%, rende 10% a mais que ela.',
          'Por isso o CDI vira régua: dá pra comparar investimentos diferentes olhando quanto do CDI cada um paga.',
        ],
      },
    ],
  },
  {
    slug: 'selic-e-inflacao',
    kind: 'licao',
    title: 'Selic e inflação',
    summary: 'Por que o juro sobe, e o que o IPCA tem a ver com o seu dinheiro.',
    icon: 'landmark',
    sections: [
      {
        heading: 'Em 2 minutos',
        body: [
          'A Selic é a taxa básica de juros do país, definida pelo Banco Central. Ela influencia os juros de empréstimos e de investimentos de renda fixa.',
          'O IPCA mede a inflação: quanto os preços subiram. Um investimento que rende menos que o IPCA faz você perder poder de compra, mesmo com saldo crescendo.',
          'Quando a inflação sobe, o Banco Central costuma aumentar a Selic para esfriar a economia.',
        ],
      },
    ],
  },
  {
    slug: 'juros-compostos',
    kind: 'licao',
    title: 'Juros compostos',
    summary: 'O efeito de ganhar juros sobre juros.',
    icon: 'trending',
    sections: [
      {
        heading: 'Em 2 minutos',
        body: [
          'Nos juros compostos, o rendimento de cada mês entra no saldo e passa a render também. No começo parece pouco, com o tempo vira bola de neve.',
          'Os dois ingredientes são tempo e constância. Aportar todo mês por muitos anos pesa mais do que acertar a melhor taxa.',
          'Teste no simulador: mude o prazo de 5 para 15 anos e veja a diferença.',
        ],
      },
    ],
  },
  {
    slug: 'reserva-de-emergencia',
    kind: 'licao',
    title: 'Reserva de emergência',
    summary: 'O primeiro passo antes de qualquer outro investimento.',
    icon: 'shield',
    sections: [
      {
        heading: 'Em 2 minutos',
        body: [
          'É um dinheiro separado para imprevistos: perder o emprego, um problema de saúde, um conserto urgente.',
          'A regra mais comum é guardar entre 3 e 12 meses de gastos essenciais. Autônomos costumam ficar na faixa de cima, pela renda menos previsível.',
          'Ela precisa estar em lugar seguro e com resgate rápido, como Tesouro Selic ou CDB com liquidez diária. Rendimento alto aqui é prioridade zero.',
        ],
      },
    ],
  },
  {
    slug: 'o-que-e-fgc',
    kind: 'licao',
    title: 'O que é o FGC?',
    summary: 'O seguro que protege parte do seu dinheiro no banco.',
    icon: 'shield',
    sections: [
      {
        heading: 'Em 2 minutos',
        body: [
          'O Fundo Garantidor de Créditos devolve o dinheiro de quem aplicou em certos produtos se a instituição quebrar.',
          'A cobertura é de até R$ 250 mil por CPF por instituição, com um teto global em janelas de tempo. Vale para CDB, LCI, LCA e poupança.',
          'Não vale para Tesouro Direto (que tem garantia do governo), ações, fundos e FIIs.',
        ],
      },
    ],
  },
  {
    slug: 'risco-e-retorno',
    kind: 'licao',
    title: 'Risco e retorno',
    summary: 'Por que ninguém ganha muito sem aceitar balançar.',
    icon: 'scale',
    sections: [
      {
        heading: 'Em 2 minutos',
        body: [
          'Em geral, quanto maior o retorno esperado, maior a chance de oscilar ou de perder dinheiro.',
          'Promessa de ganho alto e garantido é sinal de alerta, quase sempre golpe.',
          'O seu perfil depende de três coisas: prazo até você precisar do dinheiro, quanto aguenta ver o saldo cair e se a sua reserva já está pronta.',
        ],
      },
    ],
  },
]

export const ALL_TOPICS: Topic[] = [...PRODUCTS, ...LESSONS]

export function getTopic(slug: string): Topic | undefined {
  return ALL_TOPICS.find(t => t.slug === slug)
}

export interface TrailStep {
  id: string
  title: string
  description: string
  href?: string
  hrefLabel?: string
}

export const TRAIL: TrailStep[] = [
  {
    id: 'organizar',
    title: 'Organizar o dinheiro',
    description: 'Registre seus gastos por algumas semanas para saber para onde o dinheiro vai.',
    href: '/wallet',
    hrefLabel: 'Ir para a Carteira',
  },
  {
    id: 'reserva',
    title: 'Montar a reserva de emergência',
    description: 'Separe o equivalente a seis meses de gastos em um lugar seguro e com resgate rápido.',
    href: '/investments/learn/reserva-de-emergencia',
    hrefLabel: 'Entender a reserva',
  },
  {
    id: 'dividas',
    title: 'Quitar dívidas caras',
    description: 'Cartão rotativo e cheque especial cobram mais do que qualquer investimento rende.',
  },
  {
    id: 'renda-fixa',
    title: 'Começar na renda fixa',
    description: 'Tesouro Direto e CDB ajudam a criar o hábito de investir com risco baixo.',
    href: '/investments/learn/tesouro-direto',
    hrefLabel: 'Ver Tesouro Direto',
  },
  {
    id: 'diversificar',
    title: 'Diversificar com calma',
    description: 'Só depois do básico pronto, estude fundos, FIIs e ações aos poucos.',
    href: '/investments/learn/fundos',
    hrefLabel: 'Ver fundos',
  },
]
