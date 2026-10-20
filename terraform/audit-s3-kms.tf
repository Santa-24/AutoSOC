# -------------------------------------------------------------------------
# AWS KMS Customer Managed Key for AutoSOC Storage Encryption
# -------------------------------------------------------------------------

resource "aws_kms_key" "autosoc_key" {
  description             = "KMS Key for AutoSOC audit logs and DynamoDB encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableIAMUserPermissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowAutoSOCRoles"
        Effect = "Allow"
        Principal = {
          AWS = [
            aws_iam_role.autosoc_ingestion_role.arn,
            aws_iam_role.autosoc_remediation_role.arn
          ]
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_kms_alias" "autosoc_key_alias" {
  name          = "alias/autosoc-security-key-${var.environment}"
  target_key_id = aws_kms_key.autosoc_key.key_id
}

# -------------------------------------------------------------------------
# Private S3 Bucket for Forensics & Cryptographic Audit Trails
# -------------------------------------------------------------------------

resource "aws_s3_bucket" "audit_bucket" {
  bucket        = "${var.audit_bucket_name}-${data.aws_caller_identity.current.account_id}-${random_string.suffix.result}"
  force_destroy = false
}

resource "aws_s3_bucket_versioning" "audit_versioning" {
  bucket = aws_s3_bucket.audit_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audit_encryption" {
  bucket = aws_s3_bucket.audit_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.autosoc_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "audit_block_public" {
  bucket = aws_s3_bucket.audit_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "audit_lifecycle" {
  bucket = aws_s3_bucket.audit_bucket.id

  rule {
    id     = "retention-and-transition"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}
