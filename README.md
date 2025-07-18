# 🦸‍♂️ Hero App Backend (hero-app-back)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Uma aplicação backend robusta e escalável para o aplicativo Hero.  Construída com foco em segurança, performance e facilidade de manutenção.
Este projeto fornece a infraestrutura de dados e APIs necessárias para alimentar a aplicação front-end.

## 🚀 Tecnologias

Este projeto utiliza as seguintes tecnologias:

* **Framework:** [NestJS](https://nestjs.com/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [TypeORM](https://typeorm.io/)
* **Autenticação:** [JWT](https://jwt.io/)
* **Documentação:** [Swagger](https://swagger.io/)
* **Container:** [Docker](https://www.docker.com/)
* **Linguagem:** TypeScript
* **Proteção de ataque de Força bruta**


**Pré-requisitos:**
   * Docker e Docker Compose instalados e funcionando.
   * Node 18+
   * npm v9+ 

## ⚙️ Instalação e Configuração

1. **Clone o repositório:**

```bash
git clone https://github.com/leoo1992/hero-app-back
cd hero-app-back
```

2. **Instale as dependências:**

```bash
npm install
```

## 🏃 Executando o Projeto

1. **Execute o servidor:**

```bash
npm run start:dev
```

3. **Construindo e Executando com Docker Compose:**

```bash
docker-compose up -d --build
```

3. **O .env está exposto**

## 📁 Estrutura de Arquivos

```

hero-app-back/
├── src/
├── Insomnia.yaml
├── README.md
├── docker-compose.yml
├── .env
├── .prettierrc
├── .README.md
├── eslint.config.mjs
├── jest.config.js
├── nest-cli.json
├── package-lock.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json

```

## Estrutura base de Arquivos

```
src/
├── controllers/        // Controladores das rotas da API
├── decorators/         // Decoradores de codigos
├── dtos/               // DTO's
├── entities/           // Entidades
├── guards/             // Guards
├── modules/            // Modelos de dados
├── seeds/              // Alimentação inicial do banco (ADMIN)
├── services/           // Logica de negocios
├── stategies/          // Estrategias utilizadas
├── tests/              // testes realizados

```

## ✨ Recursos

- ✅ Autenticação JWT segura  
- ✅ CRUD completo para heróis  
- ✅ Sistema de batalhas entre heróis  
- ✅ Relatórios e estatísticas  
- ✅ Documentação de API com Swagger  
- ✅ Testes automatizados  
- ✅ Migrações de banco de dados  

---

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger UI após iniciar o servidor:

http://localhost:3000/api-docs

| Método | Endpoint              | Descrição                    |
| ------ | --------------------- | ---------------------------- |
| POST   | `/auth/login`         | Autenticação de usuário      |
| GET    | `/heroes`             | Listar todos os heróis       |
| POST   | `/heroes`             | Criar um novo herói          |
| GET    | `/heroes/:id`         | Obter detalhes de um herói   |
| PUT    | `/heroes/:id`         | Atualizar um herói           |
| DELETE | `/heroes/:id`         | Excluir um herói             |
| POST   | `/battles`            | Registrar uma nova batalha   |
| GET    | `/reports/hero-stats` | Obter estatísticas de heróis |


A aplicação utiliza @Roles() para proteger rotas com base no papel do usuário. Exemplo:
@Roles('ADMIN', 'HERO')
@Get()
findAll() {
  // ...
}


Desenvolvido por Leonardo Santos.


