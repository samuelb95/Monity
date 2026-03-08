from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Transaction, Account, User
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/account/<account_id>', methods=['GET'])
@jwt_required()
def get_transactions(account_id):
    """Get transactions for an account"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    transactions = Transaction.query.filter_by(account_id=account_id).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions.items],
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': page
    }), 200

@transactions_bp.route('', methods=['POST'])
@jwt_required()
def create_transaction():
    """Create a new transaction"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    account = Account.query.get(data.get('account_id'))
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    if not data.get('amount') or not data.get('type'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    transaction = Transaction(
        account_id=data['account_id'],
        category_id=data.get('category_id'),
        created_by=user_id,
        amount=data['amount'],
        type=data['type'],
        description=data.get('description'),
        date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow(),
        is_recurring=data.get('is_recurring', False),
        recurrence_pattern=data.get('recurrence_pattern'),
        tags=data.get('tags'),
        notes=data.get('notes')
    )
    
    # Update account balance
    if data['type'] == 'income':
        account.current_balance += data['amount']
    else:
        account.current_balance -= data['amount']
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction created successfully',
        'transaction': transaction.to_dict()
    }), 201

@transactions_bp.route('/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    """Get transaction details"""
    user_id = get_jwt_identity()
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    account = transaction.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(transaction.to_dict(include_account=True)), 200

@transactions_bp.route('/<transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """Update transaction"""
    user_id = get_jwt_identity()
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    account = transaction.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    old_amount = transaction.amount
    old_type = transaction.type
    
    if 'amount' in data:
        transaction.amount = data['amount']
    if 'type' in data:
        transaction.type = data['type']
    if 'description' in data:
        transaction.description = data['description']
    if 'category_id' in data:
        transaction.category_id = data['category_id']
    if 'date' in data:
        transaction.date = datetime.fromisoformat(data['date'])
    if 'tags' in data:
        transaction.tags = data['tags']
    if 'notes' in data:
        transaction.notes = data['notes']
    
    # Update account balance if amount or type changed
    if old_amount != transaction.amount or old_type != transaction.type:
        if old_type == 'income':
            account.current_balance -= old_amount
        else:
            account.current_balance += old_amount
        
        if transaction.type == 'income':
            account.current_balance += transaction.amount
        else:
            account.current_balance -= transaction.amount
    
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction updated successfully',
        'transaction': transaction.to_dict()
    }), 200

@transactions_bp.route('/<transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    """Delete transaction"""
    user_id = get_jwt_identity()
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    account = transaction.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    # Reverse balance change
    if transaction.type == 'income':
        account.current_balance -= transaction.amount
    else:
        account.current_balance += transaction.amount
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({'message': 'Transaction deleted successfully'}), 200