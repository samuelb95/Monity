from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget, Account
from datetime import datetime

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('/account/<account_id>', methods=['GET'])
@jwt_required()
def get_budgets(account_id):
    """Get budgets for an account"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    budgets = Budget.query.filter_by(account_id=account_id).all()
    
    return jsonify({
        'budgets': [budget.to_dict() for budget in budgets]
    }), 200

@budgets_bp.route('', methods=['POST'])
@jwt_required()
def create_budget():
    """Create a new budget"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    account = Account.query.get(data.get('account_id'))
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    if not data.get('name') or not data.get('limit_amount') or not data.get('period'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    budget = Budget(
        account_id=data['account_id'],
        category_id=data.get('category_id'),
        name=data['name'],
        limit_amount=data['limit_amount'],
        period=data['period'],
        start_date=datetime.fromisoformat(data['start_date']) if data.get('start_date') else datetime.utcnow(),
        end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None,
        alert_threshold=data.get('alert_threshold', 80.0)
    )
    
    db.session.add(budget)
    db.session.commit()
    
    return jsonify({
        'message': 'Budget created successfully',
        'budget': budget.to_dict()
    }), 201

@budgets_bp.route('/<budget_id>', methods=['GET'])
@jwt_required()
def get_budget(budget_id):
    """Get budget details"""
    user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    account = budget.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(budget.to_dict()), 200

@budgets_bp.route('/<budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    """Update budget"""
    user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    account = budget.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        budget.name = data['name']
    if 'limit_amount' in data:
        budget.limit_amount = data['limit_amount']
    if 'period' in data:
        budget.period = data['period']
    if 'alert_threshold' in data:
        budget.alert_threshold = data['alert_threshold']
    if 'end_date' in data:
        budget.end_date = datetime.fromisoformat(data['end_date']) if data['end_date'] else None
    if 'is_active' in data:
        budget.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Budget updated successfully',
        'budget': budget.to_dict()
    }), 200

@budgets_bp.route('/<budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    """Delete budget"""
    user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    account = budget.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({'message': 'Budget deleted successfully'}), 200