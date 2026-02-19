# Signup & Login Backend - Code Explanation

## Overview

The signup and login functionality is already implemented in the backend. This document explains how it works.

---

## File: `models.py` - Database Table

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
```

**What this does:**
- Creates a `users` table in your database
- Stores: id, email, name, hashed_password, is_active
- Email must be unique (no duplicates)
- Password is stored as hash (never plain text!)

---

## File: `auth.py` - Security Functions

### Password Hashing
```python
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```
**Example:**
- Input: `"mypassword123"`
- Output: `"$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0"`

### Password Verification
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```
**Example:**
- Input: `"mypassword123"` and hash
- Output: `True` if correct, `False` if wrong

### JWT Token Creation
```python
def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = {"sub": user.email, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```
**What this does:**
- Creates a token that expires in 30 minutes
- Contains user email
- Signed with secret key

---

## File: `main.py` - Signup Endpoint

### Complete Signup Code:
```python
@app.post("/api/auth/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return error("Email already registered")
    
    # 2. Hash password
    hashed = get_password_hash(user_data.password)
    
    # 3. Create user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed
    )
    
    # 4. Save to database
    db.add(new_user)
    db.commit()
    
    # 5. Return user
    return new_user
```

### Step-by-Step Flow:

**Step 1: Frontend sends request**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "mypassword123"
}
```

**Step 2: Backend checks database**
```python
existing = db.query(User).filter(User.email == "user@example.com").first()
# SQL: SELECT * FROM users WHERE email = 'user@example.com'
```

**Step 3: Backend hashes password**
```python
hashed = get_password_hash("mypassword123")
# Result: "$2b$12$LQv3c1yqBWVHxkd0LHAkCO..."
```

**Step 4: Backend saves to database**
```python
db.add(new_user)
db.commit()
# SQL: INSERT INTO users (email, name, hashed_password) 
#      VALUES ('user@example.com', 'John Doe', '$2b$12$...')
```

**Step 5: Backend returns response**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "is_active": true
}
```

---

## File: `main.py` - Login Endpoint

### Complete Login Code:
```python
@app.post("/api/auth/login-json")
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Authenticate (check email/password)
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        return error("Incorrect email or password")
    
    # 2. Create token
    token = create_access_token(data={"sub": user.email})
    
    # 3. Return token + user
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
```

### Step-by-Step Flow:

**Step 1: Frontend sends request**
```json
POST /api/auth/login-json
{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

**Step 2: Backend finds user**
```python
user = db.query(User).filter(User.email == "user@example.com").first()
# SQL: SELECT * FROM users WHERE email = 'user@example.com'
```

**Step 3: Backend verifies password**
```python
verify_password("mypassword123", user.hashed_password)
# Compares plain password with stored hash
```

**Step 4: Backend creates token**
```python
token = create_access_token({"sub": "user@example.com"})
# Creates JWT token valid for 30 minutes
```

**Step 5: Backend returns response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## Database Queries (What Actually Happens)

### Signup - INSERT Query
```sql
INSERT INTO users (email, name, hashed_password, is_active, created_at)
VALUES ('user@example.com', 'John Doe', '$2b$12$...', true, NOW());
```

### Login - SELECT Query
```sql
SELECT * FROM users WHERE email = 'user@example.com';
-- Then verify password hash matches
```

---

## Testing with cURL

### Test Signup:
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "test123456"
  }'
```

### Test Login:
```bash
curl -X POST "http://localhost:8000/api/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Use Token for Protected Route:
```bash
curl -X GET "http://localhost:8000/api/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Features

✅ **Password Hashing:** Passwords never stored in plain text
✅ **JWT Tokens:** Secure token-based authentication
✅ **Email Uniqueness:** Prevents duplicate accounts
✅ **Token Expiration:** Tokens expire after 30 minutes
✅ **Password Verification:** Secure bcrypt verification

---

## Summary

**Signup:**
1. Check email doesn't exist
2. Hash password
3. Save user to database
4. Return user data

**Login:**
1. Find user by email
2. Verify password
3. Create JWT token
4. Return token + user

**Everything is already implemented!** Just:
1. Create database
2. Set connection string
3. Run backend
4. Use the endpoints!


