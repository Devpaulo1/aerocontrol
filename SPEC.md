# SPEC.MD — AeroControl (Gestão de Manutenção de Aeronaves)

## 1. Visão Geral do Produto (PRD)
Aplicação web Single Page Application (SPA) Mobile-First para controle técnico de manutenção de aeronaves, substituindo anotações manuais (Google Keep) por uma interface estruturada, auditável e com rastreabilidade entre aeronaves.

### 1.1. Problemas Resolvidos
- Eliminação de listas planas misturando discrepâncias, empréstimos de peças, terceiros e checks de torque.
- Rastreabilidade bidirecional de canibalização/empréstimo de componentes entre aeronaves (ex: PS-GMD ↔ PR-GMD ↔ PS-CML).
- Destaque crítico para vencimentos de Torque Check baseados em Horas de Voo (HV/TSN) ou data.
- Migração rápida de notas antigas (colar texto bruto ou importar prints) e exportação formatada para WhatsApp.

### 1.2. Entidades e Regras de Negócio
1. **Aeronave (`Aircraft`)**:
   - Campos: `id`, `prefix` (ex: PS-GMD), `model` (ex: Bell 407 / Esquilo), `tsn_hours` (Horas totais atuais), `status` (Ativa, Em Inspeção, AOG).
2. **Pacote de Manutenção / Fase (`MaintenancePhase`)**:
   - Permite separar históricos (ex: "Inspeção 1000h", "Linha / Pista", "Grande Intervenção").
3. **Item de Controle (`MaintenanceItem`)**:
   - Categorias obrigatórias:
     - `DISCREPANCY` (Discrepâncias `DISC` / `A-DISC`): inclui status (`OPEN`, `IN_PROGRESS`, `WAITING_PART`, `CLOSED`), medições técnicas (ex: comprimento/distância de trincas) e referência de manual.
     - `TASK` (Itens a Efetuar): checklist operacional com prioridade e responsável.
     - `LOAN_MATERIAL` (Materiais e Empréstimos): direção (`INBOUND` = recebido de outra aeronave; `OUTBOUND` = emprestado para outra aeronave; `PURCHASE` = aguardando compra), `part_number`, `serial_number`, `related_aircraft_prefix`, `returned` (boolean).
     - `THIRD_PARTY` (Serviços de Terceiros): fornecedor/oficina, data de envio, previsão de retorno, status (`SENT`, `IN_SERVICE`, `READY`, `RETURNED`).
     - `TORQUE_CHECK` (Atenção & Checks de Torque): valor aplicado (ex: `160-200 in-lbs`), referência técnica (ex: `cf-2018-35`), gatilho de vencimento (`due_hours` ou `due_date`) e alerta visual crítico.

---

## 2. Arquitetura Técnica e Stack
- **Framework**: React 18 + TypeScript + Vite (SPA com React Router DOM).
- **Estilização**: Tailwind CSS + Lucide React (ícones) + Design System escuro/claro otimizado para uso em hangar (alto contraste, touch targets >= 44px).
- **Gerenciamento de Estado & Formulários**:
  - React Hook Form + Zod (validação estrita de schemas).
  - Context API + Custom Hooks (arquitetura desacoplada para trocar facilmente `LocalStorage` por `Supabase` na Fase 2).
- **Persistência (Fase 1 - MVP Offline-First)**: `localStorage` com camada de repositório assíncrona (`Repository Pattern`) + dados iniciais (seed) baseados na frota PS-GMD, PR-GMD e PS-CML.

---

## 3. Estrutura de Diretórios (Feature-Based / Clean Architecture)
```text
src/
├── components/
│   ├── ui/               # Botões, Badges, Modais, Inputs, Tabs
│   └── layout/           # Header (Seletor de Aeronave + TSN), BottomNav (Mobile)
├── features/
│   ├── aircrafts/        # Gerenciamento de matrículas e atualização de Horas de Voo
│   ├── items/            # CRUD de itens, filtros, busca e cards específicos por categoria
│   ├── loans/            # Visão cruzada de empréstimos entre aeronaves
│   ├── importer/         # Parser inteligente de texto colado (formato Keep) -> JSON estruturado
│   └── exporter/         # Gerador de relatório formatado para WhatsApp (Clipboard API)
├── repositories/
│   ├── interfaces.ts     # Contratos (IAircraftRepository, IItemRepository)
│   └── localStorageRepo.ts # Implementação inicial (pronta para migrar para Supabase)
├── types/
│   └── maintenance.ts    # Tipagens TypeScript estritas (Discriminated Unions por categoria)
├── utils/
│   ├── keepParser.ts     # Regex/heurística para converter notas antigas em itens categorizados
│   └── whatsappFormat.ts # Formatação agrupada fiel ao padrão operacional
└── App.tsx