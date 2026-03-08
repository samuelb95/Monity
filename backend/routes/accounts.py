from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Account, User, user_accounts

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('', methods=['GET'])
@jwt_required()
def get_accounts():
    """Get all accounts for current user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    accounts = user.accounts
    return jsonify({
        'accounts': [account.to_dict(include_users=True) for account in accounts]
    }), 200

@accounts_bp.route('', methods=['POST'])
@jwt_required()
def create_account():
    """Create a new account"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('name') or not data.get('type'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    account = Account(
        name=data['name'],
        type=data['type'],
        currency=data.get('currency', 'USD'),
        description=data.get('description'),
        initial_balance=data.get('initial_balance', 0.0)
    )
    account.current_balance = account.initial_balance
    
    db.session.add(account)
    db.session.flush()
    
    # Add creator as owner
    db.session.execute(
        user_accounts.insert().values(
            user_id=user_id,
            account_id=account.id,
            role='owner'
        )
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Account created successfully',
        'account': account.to_dict(include_users=True)
    }), 201

@accounts_bp.route('/<account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    """Get account details"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Check if user has access to this account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(account.to_dict(include_users=True)), 200

@accounts_bp.route('/<account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    """Update account"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Check if user is owner
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        account.name = data['name']
    if 'description' in data:
        account.description = data['description']
    if 'currency' in data:
        account.currency = data['currency']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Account updated successfully',
        'account': account.to_dict(include_users=True)
    }), 200

@accounts_bp.route('/<account_id>/add-user', methods=['POST'])
@jwt_required()
def add_user_to_account(account_id):
    """Add user to shared account"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Check if current user is owner
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    target_user = User.query.filter_by(email=data.get('email')).first()
    
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user already has access
    if target_user in account.owners:
        return jsonify({'error': 'User already has access to this account'}), 400
    
    role = data.get('role', 'member')
    db.session.execute(
        user_accounts.insert().values(
            user_id=target_user.id,
            account_id=account.id,
            role=role
        )
    )
    db.session.commit()
    
    return jsonify({
        'message': 'User added to account successfully',
        'account': account.to_dict(include_users=True)
    }), 200

@accounts_bp.route('/<account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    """Delete account"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Check if user is owner
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(account)
    db.session.commit()
    
    return jsonify({'message': 'Account deleted successfully'}), 200