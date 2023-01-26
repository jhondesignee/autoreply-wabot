# Introdução

Este é um exemplo de como usar a API OpenAI com JavaScript e de como criar um chat bot para o WhatsApp

# Instalação

Antes de começar, você deve ter um token do OpenAI. Crie um [aqui](https://beta.openai.com/account/api-keys)

Também será utilizado um app de respostas automáticas para o WhatsApp e o Termux

Instale o Auto Reply pela Play Store [aqui](https://play.google.com/store/apps/details?id=com.pransuinc.autoreply)

Instale o Termux pelo GitHub [aqui](https://)

<hr>

Clone esse repositório

```bash
git clone https://github.com/jhondesignee/autoreply-wabot
```

Acesse a pasta e instale as dependências

```bash
cd autoreply-wabot
yarn install
```

# Configuração

No Auto Reply, crie uma nova regra com as seguintes configurações:

- responder a todas as mensagens

<div align="center">
  <img src="./assets/config1.png" alt="config1">
</div>

- responder com seu próprio servidor

<div align="center">
  <img src="./assets/config2.png" alt="config2">
</div>

<hr>

Com tudo configurado, inicie o bot

```bash
yarn start
```

O Auto Reply responderá a todas as notificações do WhatsApp que começarem com "/ask" seguido de um prompt
