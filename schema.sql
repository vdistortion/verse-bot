CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tg_id TEXT UNIQUE,
    vk_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bot_content (
    id SERIAL PRIMARY KEY,
    text_content TEXT,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS command_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform TEXT CHECK (platform IN ('telegram', 'vk')),
    command TEXT,
    created_at TIMESTAMP DEFAULT now()
);
