variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "enable_security_hub" {
  description = "Enable AWS Security Hub (Set to false to avoid activating paid services automatically)"
  type        = bool
  default     = false
}

variable "enable_guardduty" {
  description = "Enable Amazon GuardDuty detector (Set to false by default to prevent unexpected billing)"
  type        = bool
  default     = false
}

variable "audit_bucket_name" {
  description = "Name for the private S3 audit & forensic storage bucket"
  type        = string
  default     = "autosoc-security-audit-records"
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for persistent incident records"
  type        = string
  default     = "AutoSOC_Incidents"
}
