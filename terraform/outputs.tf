output "ingestion_role_arn" {
  description = "ARN of the scoped read-only telemetry ingestion IAM role"
  value       = aws_iam_role.autosoc_ingestion_role.arn
}

output "remediation_role_arn" {
  description = "ARN of the gated response execution IAM role"
  value       = aws_iam_role.autosoc_remediation_role.arn
}

output "audit_s3_bucket_name" {
  description = "Private S3 audit and forensic bucket name"
  value       = aws_s3_bucket.audit_bucket.id
}

output "kms_key_arn" {
  description = "ARN of the AutoSOC Customer Master Key (CMK)"
  value       = aws_kms_key.autosoc_key.arn
}

output "dynamodb_table_name" {
  description = "DynamoDB incident table name"
  value       = aws_dynamodb_table.incidents_table.name
}

output "security_hub_enabled" {
  description = "Whether AWS Security Hub was provisioned"
  value       = var.enable_security_hub
}

output "guardduty_enabled" {
  description = "Whether Amazon GuardDuty was provisioned"
  value       = var.enable_guardduty
}
