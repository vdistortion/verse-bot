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
```

The example app starts every bot whose token is configured in `.env`. To run only
Telegram or only VK, fill in the corresponding token and leave the other one empty.
