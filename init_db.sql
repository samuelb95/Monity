-- Create users table (matching SQLAlchemy model)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(20) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    initial_balance FLOAT DEFAULT 0.0,
    current_balance FLOAT DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction_categories table
CREATE TABLE IF NOT EXISTS transaction_categories (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#808080',
    icon VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, name)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id VARCHAR(36) REFERENCES transaction_categories(id) ON DELETE SET NULL,
    created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    amount FLOAT NOT NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    tags JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id VARCHAR(36) REFERENCES transaction_categories(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    limit_amount FLOAT NOT NULL,
    period VARCHAR(20) NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    alert_threshold FLOAT DEFAULT 80.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_accounts junction table
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    account_id VARCHAR(36) REFERENCES accounts(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, account_id)
);

-- Insert test data
INSERT INTO users (id, email, username, password_hash, first_name, last_name, is_active)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'samuel.b95@outlook.fr', 'samuel', 'pbkdf2:sha256:600000$test', 'Samuel', 'B', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO accounts (id, name, type, currency, current_balance, is_active)
VALUES ('660e8400-e29b-41d4-a716-446655440001', 'Mon Compte Personnel', 'personal', 'EUR', 5000, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO user_accounts (user_id, account_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'owner')
ON CONFLICT DO NOTHING;

INSERT INTO transaction_categories (id, account_id, name, color, type)
VALUES 
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Salaire', '#4CAF50', 'income'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Loyer', '#FF5252', 'expense'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Nourriture', '#FF9800', 'expense')
ON CONFLICT DO NOTHING;

INSERT INTO transactions (id, account_id, category_id, created_by, amount, type, description, date)
VALUES 
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 3000, 'income', 'Salaire', NOW()),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 800, 'expense', 'Loyer', NOW()),
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 250, 'expense', 'Nourriture', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO budgets (id, account_id, category_id, name, limit_amount, period, start_date, is_active)
VALUES ('990e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 'Budget Nourriture', 500, 'monthly', NOW(), TRUE)
ON CONFLICT DO NOTHING;
