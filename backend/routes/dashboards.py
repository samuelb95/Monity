from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Account, Transaction, Budget, user_accounts
from datetime import datetime
from sqlalchemy import func, and_

dashboards_bp = Blueprint('dashboards', __name__)

@dashboards_bp.route('/current', methods=['GET'])
def get_current_dashboard():
    """Get current user's dashboard data"""
    from flask_jwt_extended import verify_jwt_in_request
    from flask import request
    
    # Try to get JWT from headers (from Supabase or our backend)
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except:
        # If no valid JWT, return empty dashboard
        user_id = None
    
    if not user_id:
        # Return minimal dashboard for unauthenticated users
        return {
            'accounts': [],
            'primary_account': None,
            'total_balance': 0,
            'transactions': [],
            'budgets': [],
            'user': None,
            'message': 'Unauthenticated - returning minimal dashboard'
        }, 200
    
    try:
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        accounts = Account.query.join(user_accounts).filter(
            user_accounts.c.user_id == user_id
        ).all()
        
        if not accounts:
            return {
                'accounts': [],
                'primary_account': None,
                'total_balance': 0,
                'transactions': [],
                'budgets': [],
                'user': user.to_dict()
            }, 200
        
        primary_account = accounts[0]
        total_balance = sum(account.current_balance for account in accounts)
        
        recent_transactions = Transaction.query.filter(
            Transaction.account_id.in_([a.id for a in accounts])
        ).order_by(Transaction.date.desc()).limit(10).all()
        
        active_budgets = Budget.query.filter(
            Budget.account_id.in_([a.id for a in accounts]),
            Budget.is_active == True
        ).all()
        
        budgets_data = []
        for budget in active_budgets:
            spent = db.session.query(func.sum(Transaction.amount)).filter(
                and_(
                    Transaction.account_id == budget.account_id,
                    Transaction.type == 'expense',
                    Transaction.date >= budget.start_date,
                    Transaction.date <= (budget.end_date or datetime.utcnow())
                )
            ).scalar() or 0
            
            budget_dict = budget.to_dict()
            budget_dict['spent'] = spent
            budget_dict['percentage'] = (spent / budget.limit_amount * 100) if budget.limit_amount > 0 else 0
            budgets_data.append(budget_dict)
        
        return {
            'accounts': [a.to_dict() for a in accounts],
            'primary_account': primary_account.to_dict(include_users=True),
            'total_balance': total_balance,
            'transactions': [t.to_dict() for t in recent_transactions],
            'budgets': budgets_data,
            'user': user.to_dict()
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500