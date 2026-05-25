# NoteFlow — Bloco de Notas Inteligente

Aplicação web full-stack de anotações com assistência de Inteligência Artificial. Desenvolvida como projeto de portfólio para demonstrar arquitetura limpa, integração com APIs externas e práticas modernas de desenvolvimento tanto no frontend quanto no backend.

O usuário pode criar, editar e organizar notas com suporte a tags, e contar com um assistente de IA integrado capaz de resumir o conteúdo e gerar títulos automaticamente a partir do texto escrito.

---
## Visual do Projeto
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/91e6ad0d-4268-4b8f-8f89-1fee2dbfc44b" />
<img width="1920" height="1080" alt="Screenshot (23)" src="https://github.com/user-attachments/assets/f89b2572-5325-4438-ad08-74b7a3231ffe" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/49c31cbb-b31f-4a9c-845a-b1764469f105" />

---
## Funcionalidades

- **Autenticação segura** — Registro e login com JWT (JSON Web Token), roles de `Admin` e `User`, proteção de rotas no frontend e no backend
- **CRUD completo de notas** — Criar, editar, arquivar, restaurar e excluir notas com salvamento automático via debounce
- **Sistema de Tags** — Criação e associação de tags às notas, com filtro por tag no dashboard
- **Assistente de IA** — Integração com Google Gemini para resumir notas e gerar títulos automaticamente a partir do conteúdo
- **Painel Administrativo** — Endpoints exclusivos para administradores (estatísticas globais, gerenciamento de usuários)
- **Design Premium** — Interface dark mode com Tailwind CSS, animações com Framer Motion e layout responsivo

---

## Tecnologias

### Frontend
| Tecnologia | Finalidade |
|---|---|
| React 19 + TypeScript | Framework principal e tipagem estática |
| Vite | Bundler e dev server |
| Tailwind CSS v4 | Estilização utilitária |
| Framer Motion | Animações e transições |
| React Router v6 | Roteamento client-side |
| Axios | Requisições HTTP com interceptors JWT |
| React Hook Form + Zod | Formulários e validação de schemas |
| TanStack Query | Cache e estado de servidor |
| Lucide React | Biblioteca de ícones |

### Backend
| Tecnologia | Finalidade |
|---|---|
| .NET 10 / ASP.NET Core Web API | Framework da API REST |
| Entity Framework Core | ORM e migrations |
| SQL Server | Banco de dados relacional |
| ASP.NET Core Identity | Autenticação, autorização e gerenciamento de usuários |
| JWT Bearer Authentication | Autenticação stateless por token |
| Google Gemini SDK | Integração com IA generativa |

### Arquitetura e Padrões
- **Repository Pattern** com interfaces para inversão de dependência
- **Clean Architecture** — separação em camadas (Controllers → Interfaces → Repositories → Data)
- **DTOs** para entrada e saída de dados, prevenindo vazamento de entidades internas
- **BaseController** com extração do `UserId` via claims JWT

### Uso de IA
- Uso da Inteligência Artificial como aceleradora de engenharia, e não como muleta. O processo envolveu a criação de uma documentação customizada de Agent Skills (mapeando as regras e a arquitetura do NoteFlow) para alimentar e especializar a IA antes do desenvolvimento. Essa abordagem de engenharia de contexto e instruções precisas foi o segredo para otimizar o consumo de tokens, mitigar alucinações da ferramenta e garantir um código confiável e arquiteturalmente sólido.
---

## Rodando Localmente

### Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [SQL Server](https://www.microsoft.com/sql-server) (ou SQL Server Express / Docker)
- Uma chave de API do [Google AI Studio](https://aistudio.google.com)

---

### 1. Clone o repositório

```bash
git clone https://github.com/JoaoPaulo-Costa01/NoteFlow
```
---

### 2. Configurando o Backend

```bash
cd NoteFlowApi
```

Crie o arquivo de configuração local a partir do exemplo:

```bash
cp appsettings.example.json appsettings.json
```

Abra o `appsettings.json` e preencha com seus valores reais:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NoteFlowDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "sua_chave_secreta_com_minimo_32_caracteres",
    "Issuer": "NoteFlowApi",
    "Audience": "NoteFlowClient",
    "ExpiresInMinutes": "60"
  },
  "GeminiSettings": {
    "ApiKey": "sua_chave_do_google_ai_studio",
    "Model": "gemini-2.5-flash"
  },
  "AdminSeed": {
    "Email": "email",
    "Password": "senha"
  }
}
```

Restaure os pacotes, aplique as migrations e rode a API:

```bash
cd NoteFlowApi
```

```bash
dotnet restore
dotnet ef database update
dotnet run
```

A API estará disponível em `https://localhost:{porta}`. A porta exata aparece no terminal ao subir o projeto.

---

### 3. Configurando o Frontend
```bash
cd ../noteflow-web
```

Instale as dependências:
```bash
npm install
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## Estrutura de Pastas
```text
noteflow/
├── NoteFlowApi/                  # Backend .NET
│   ├── Controllers/              # Endpoints da API
│   ├── Data/                     # DbContext e configurações EF Core
│   ├── Dtos/                     # Data Transfer Objects
│   ├── Infrastructure/
│   │   └── AI/                   # Integração com Google Gemini
│   ├── Interfaces/               # Contratos dos repositórios e serviços
│   ├── Migrations/               # Histórico de migrations do EF Core
│   ├── Models/                   # Entidades de domínio
│   ├── Repositories/             # Isola e centraliza a lógica de acesso aos dados (ponte com BD)
│   ├── appsettings.example.json  # Template de configuração (sem segredos)
│   └── Dockerfile
│
└── noteflow-web/                 # Frontend React
    ├── src/
    │   ├── components/
    │   ├── contexts/             # AuthContext (JWT)
    │   ├── hooks/
    │   ├── pages/                # LoginPage, RegisterPage, NotesPage
    │   ├── services/             # Axios + interceptors
    │   └── types/                # Interfaces TypeScript
    └── .env.example
```
---

### Backend (`appsettings.json`)

| Chave | Descrição |
|---|---|
| `ConnectionStrings__DefaultConnection` | String de conexão com o SQL Server |
| `JwtSettings__SecretKey` | Chave secreta para assinar os tokens JWT (mínimo 32 caracteres) |
| `JwtSettings__Issuer` | Emissor do token |
| `JwtSettings__Audience` | Audiência do token |
| `GeminiSettings__ApiKey` | Chave de API do Google AI Studio |
| `AdminSeed__Email` | E-mail do usuário admin criado no primeiro boot |
| `AdminSeed__Password` | Senha do usuário admin criado no primeiro boot |

## Autor

Desenvolvido por **[João Paulo]**
