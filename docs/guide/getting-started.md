# Getting Started

## Prerequisites

- Node.js 20+
- PostgreSQL (optional, required for user persistence)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/vdistortion/verse-bot
cd verse-bot
npm install
```

Copy the environment file and fill in your tokens:

```bash
cp .env.example .env
```

## Running

```bash
npm run dev

# Telegram only
npm run dev:tg

# VK only
npm run dev:vk
```
