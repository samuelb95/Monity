from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, TransactionCategory, Account

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/account/<account_id>', methods=['GET'])
@jwt_required()
def get_categories(account_id):
    """Get categories for an account"""
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    categories = TransactionCategory.query.filter_by(account_id=account_id).all()
    
    return jsonify({
        'categories': [cat.to_dict() for cat in categories]
    }), 200

@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """Create a new category"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    account = Account.query.get(data.get('account_id'))
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    if not data.get('name') or not data.get('type'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check for duplicates
    existing = TransactionCategory.query.filter_by(
        account_id=data['account_id'],
        name=data['name']
    ).first()
    
    if existing:
        return jsonify({'error': 'Category already exists'}), 400
    
    category = TransactionCategory(
        account_id=data['account_id'],
        name=data['name'],
        type=data['type'],
        color=data.get('color', '#808080'),
        icon=data.get('icon')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201

@categories_bp.route('/<category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """Get category details"""
    user_id = get_jwt_identity()
    category = TransactionCategory.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    account = category.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(category.to_dict()), 200

@categories_bp.route('/<category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update category"""
    user_id = get_jwt_identity()
    category = TransactionCategory.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    account = category.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        category.name = data['name']
    if 'color' in data:
        category.color = data['color']
    if 'icon' in data:
        category.icon = data['icon']
    if 'type' in data:
        category.type = data['type']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200

@categories_bp.route('/<category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete category"""
    user_id = get_jwt_identity()
    category = TransactionCategory.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    account = category.account
    if not any(owner.id == user_id for owner in account.owners):
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({'message': 'Category deleted successfully'}), 200