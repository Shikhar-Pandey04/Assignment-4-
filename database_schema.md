# Database Schema - Contract Management SaaS

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│                USERS                │
├─────────────────────────────────────┤
│ user_id (UUID, PK)                  │
│ username (VARCHAR(50), UNIQUE)      │
│ email (VARCHAR(100), UNIQUE)        │
│ password_hash (VARCHAR(255))        │
│ created_at (TIMESTAMP)              │
└─────────────────────────────────────┘
                    │
                    │ 1:N
                    │
┌─────────────────────────────────────┐
│              DOCUMENTS              │
├─────────────────────────────────────┤
│ doc_id (UUID, PK)                   │
│ user_id (UUID, FK) ────────────────┐│
│ filename (VARCHAR(255))             ││
│ original_filename (VARCHAR(255))    ││
│ file_size (INTEGER)                 ││
│ file_type (VARCHAR(10))             ││
│ uploaded_on (TIMESTAMP)             ││
│ contract_name (VARCHAR(255))        ││
│ parties (TEXT)                      ││
│ expiry_date (TIMESTAMP)             ││
│ status (VARCHAR(20))                ││
│ risk_score (VARCHAR(10))            ││
│ processing_status (VARCHAR(20))     ││
└─────────────────────────────────────┘│
                    │                  │
                    │ 1:N              │
                    │                  │
┌─────────────────────────────────────┐│
│               CHUNKS                ││
├─────────────────────────────────────┤│
│ chunk_id (UUID, PK)                 ││
│ doc_id (UUID, FK) ──────────────────┘│
│ user_id (UUID, FK) ──────────────────┘
│ text_chunk (TEXT)                   │
│ embedding (VECTOR[384])             │
│ page_number (INTEGER)               │
│ chunk_index (INTEGER)               │
│ confidence_score (FLOAT)            │
│ metadata (TEXT/JSON)                │
│ created_at (TIMESTAMP)              │
└─────────────────────────────────────┘
```

## Table Descriptions

### USERS Table
**Purpose**: Store user authentication and profile information for multi-tenant isolation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY | Unique identifier for each user |
| username | VARCHAR(50) | UNIQUE, NOT NULL | User's chosen username |
| email | VARCHAR(100) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

**Indexes**:
- Primary key on `user_id`
- Unique index on `username`
- Unique index on `email`

### DOCUMENTS Table
**Purpose**: Store contract metadata and processing information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| doc_id | UUID | PRIMARY KEY | Unique identifier for each document |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to owning user |
| filename | VARCHAR(255) | NOT NULL | Stored filename (with UUID prefix) |
| original_filename | VARCHAR(255) | NOT NULL | Original uploaded filename |
| file_size | INTEGER | | File size in bytes |
| file_type | VARCHAR(10) | | File extension (.pdf, .txt, .docx) |
| uploaded_on | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| contract_name | VARCHAR(255) | | Human-readable contract name |
| parties | TEXT | | JSON string of involved parties |
| expiry_date | TIMESTAMP | | Contract expiration date |
| status | VARCHAR(20) | DEFAULT 'Active' | Active, Renewal Due, Expired |
| risk_score | VARCHAR(10) | DEFAULT 'Low' | Low, Medium, High |
| processing_status | VARCHAR(20) | DEFAULT 'pending' | pending, processing, completed, failed |

**Indexes**:
- Primary key on `doc_id`
- Foreign key index on `user_id`
- Index on `status` for filtering
- Index on `risk_score` for filtering
- Index on `uploaded_on` for sorting

### CHUNKS Table
**Purpose**: Store document text chunks with vector embeddings for semantic search.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| chunk_id | UUID | PRIMARY KEY | Unique identifier for each chunk |
| doc_id | UUID | FOREIGN KEY, NOT NULL | Reference to parent document |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to owning user (for isolation) |
| text_chunk | TEXT | NOT NULL | Extracted text content |
| embedding | VECTOR[384] | | 384-dimensional vector embedding |
| page_number | INTEGER | | Source page number |
| chunk_index | INTEGER | | Sequential chunk number within document |
| confidence_score | FLOAT | DEFAULT 0.0 | Extraction confidence (0.0-1.0) |
| metadata | TEXT | | JSON string with additional metadata |
| created_at | TIMESTAMP | DEFAULT NOW() | Chunk creation timestamp |

**Indexes**:
- Primary key on `chunk_id`
- Foreign key index on `doc_id`
- Foreign key index on `user_id`
- Vector index on `embedding` for similarity search
- Index on `chunk_index` for ordering

## Relationships

### User → Documents (1:N)
- One user can have many documents
- CASCADE DELETE: When user is deleted, all their documents are deleted
- Ensures complete data isolation between users

### Document → Chunks (1:N)
- One document can have many chunks
- CASCADE DELETE: When document is deleted, all its chunks are deleted
- Maintains referential integrity

### User → Chunks (1:N)
- Direct relationship for efficient user-scoped queries
- Enables fast filtering by user_id in vector searches
- Redundant but necessary for performance

## Multi-Tenant Isolation

All queries MUST include user_id filtering to ensure data isolation:

```sql
-- Correct: User-scoped query
SELECT * FROM documents WHERE user_id = $1;

-- Correct: User-scoped vector search
SELECT chunk_id, text_chunk, (embedding <=> $2) as distance 
FROM chunks 
WHERE user_id = $1 
ORDER BY embedding <=> $2 
LIMIT 10;

-- WRONG: Global query (security risk)
SELECT * FROM documents;
```

## Vector Search Implementation

### pgvector Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Vector Similarity Search
```sql
-- Cosine similarity search
SELECT 
    chunk_id,
    text_chunk,
    (1 - (embedding <=> $query_embedding)) as similarity_score
FROM chunks 
WHERE user_id = $user_id
ORDER BY embedding <=> $query_embedding
LIMIT $limit;
```

### Index for Performance
```sql
-- Create HNSW index for fast vector search
CREATE INDEX chunks_embedding_idx ON chunks 
USING hnsw (embedding vector_cosine_ops);
```

## Sample Data Flow

1. **User Registration**:
   ```sql
   INSERT INTO users (user_id, username, email, password_hash)
   VALUES (gen_random_uuid(), 'john_doe', 'john@example.com', '$2b$12$...');
   ```

2. **Document Upload**:
   ```sql
   INSERT INTO documents (doc_id, user_id, filename, original_filename, ...)
   VALUES (gen_random_uuid(), $user_id, 'uuid_contract.pdf', 'contract.pdf', ...);
   ```

3. **Chunk Creation**:
   ```sql
   INSERT INTO chunks (chunk_id, doc_id, user_id, text_chunk, embedding, ...)
   VALUES (gen_random_uuid(), $doc_id, $user_id, 'Contract text...', $embedding, ...);
   ```

4. **Vector Search**:
   ```sql
   SELECT c.*, d.contract_name
   FROM chunks c
   JOIN documents d ON c.doc_id = d.doc_id
   WHERE c.user_id = $user_id
   ORDER BY c.embedding <=> $query_embedding
   LIMIT 5;
   ```

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Vector column has HNSW index for fast similarity search
- Commonly filtered columns (status, risk_score) are indexed

### Partitioning (Future Enhancement)
- Could partition chunks table by user_id for very large datasets
- Would improve query performance and maintenance

### Archiving Strategy
- Soft delete for documents (add deleted_at column)
- Archive old chunks to separate table
- Implement data retention policies

## Security Features

### Data Isolation
- Every query filtered by user_id
- No cross-user data access possible
- Foreign key constraints enforce relationships

### Audit Trail
- All tables have created_at timestamps
- Could add updated_at and updated_by columns
- Document processing status tracking

### Backup Strategy
- Regular PostgreSQL backups
- Point-in-time recovery capability
- Vector embeddings can be regenerated if needed

## Migration Scripts

### Initial Schema
```sql
-- Create users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(10),
    uploaded_on TIMESTAMP DEFAULT NOW(),
    contract_name VARCHAR(255),
    parties TEXT,
    expiry_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active',
    risk_score VARCHAR(10) DEFAULT 'Low',
    processing_status VARCHAR(20) DEFAULT 'pending'
);

-- Create chunks table
CREATE TABLE chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    text_chunk TEXT NOT NULL,
    embedding VECTOR(384),
    page_number INTEGER,
    chunk_index INTEGER,
    confidence_score FLOAT DEFAULT 0.0,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_uploaded_on ON documents(uploaded_on);
CREATE INDEX idx_chunks_doc_id ON chunks(doc_id);
CREATE INDEX idx_chunks_user_id ON chunks(user_id);
CREATE INDEX idx_chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);
```

This schema provides a solid foundation for the Contract Management SaaS with proper multi-tenant isolation, efficient vector search capabilities, and room for future enhancements.
