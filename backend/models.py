from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    """User model - represents an individual user"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    avatar_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('Account', secondary='user_accounts', backref='owners')
    transactions = db.relationship('Transaction', backref='created_by_user', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat()
        }


class Account(db.Model):
    """Account model - can be personal or shared"""
    __tablename__ = 'accounts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'personal' or 'shared'
    currency = db.Column(db.String(3), default='USD')
    description = db.Column(db.Text)
    initial_balance = db.Column(db.Float, default=0.0)
    current_balance = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='account', lazy='dynamic', cascade='all, delete-orphan')
    budgets = db.relationship('Budget', backref='account', lazy='dynamic', cascade='all, delete-orphan')
    categories = db.relationship('TransactionCategory', backref='account', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_users=False):
        data = {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'currency': self.currency,
            'description': self.description,
            'initial_balance': self.initial_balance,
            'current_balance': self.current_balance,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
        if include_users:
            data['owners'] = [user.to_dict() for user in self.owners]
        return data


user_accounts = db.Table('user_accounts',
    db.Column('user_id', db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('account_id', db.String(36), db.ForeignKey('accounts.id', ondelete='CASCADE'), primary_key=True),
    db.Column('role', db.String(20), default='member'),  # 'owner' or 'member'
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)


class TransactionCategory(db.Model):
    """Transaction category model"""
    __tablename__ = 'transaction_categories'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = db.Column(db.String(36), db.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(7), default='#808080')
    icon = db.Column(db.String(50))
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='category', lazy='dynamic')
    
    __table_args__ = (db.UniqueConstraint('account_id', 'name', name='uq_account_category_name'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'icon': self.icon,
            'type': self.type
        }


class Transaction(db.Model):
    """Transaction model - represents money flow"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = db.Column(db.String(36), db.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True)
    category_id = db.Column(db.String(36), db.ForeignKey('transaction_categories.id', ondelete='SET NULL'))
    created_by = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    description = db.Column(db.String(255))
    date = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_pattern = db.Column(db.String(50))  # 'daily', 'weekly', 'monthly', 'yearly'
    tags = db.Column(db.JSON)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_account=False):
        data = {
            'id': self.id,
            'account_id': self.account_id,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else None,
            'created_by': self.created_by,
            'amount': self.amount,
            'type': self.type,
            'description': self.description,
            'date': self.date.isoformat(),
            'is_recurring': self.is_recurring,
            'recurrence_pattern': self.recurrence_pattern,
            'tags': self.tags,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }
        if include_account:
            data['account'] = self.account.to_dict()
        return data


class Budget(db.Model):
    """Budget model - spending limits for categories"""
    __tablename__ = 'budgets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = db.Column(db.String(36), db.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True)
    category_id = db.Column(db.String(36), db.ForeignKey('transaction_categories.id', ondelete='CASCADE'))
    name = db.Column(db.String(120), nullable=False)
    limit_amount = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(20), nullable=False)  # 'monthly', 'yearly'
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    alert_threshold = db.Column(db.Float, default=80.0)  # Alert when 80% of budget is spent
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_spent=False):
        data = {
            'id': self.id,
            'account_id': self.account_id,
            'category_id': self.category_id,
            'name': self.name,
            'limit_amount': self.limit_amount,
            'period': self.period,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'alert_threshold': self.alert_threshold,
            'is_active': self.is_active
        }
        return data