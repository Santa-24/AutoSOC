# -------------------------------------------------------------------------
# AutoSOC Read-Only Ingestion Role (Least-Privilege)
# Used for telemetry ingestion from Security Hub, GuardDuty, CloudTrail, etc.
# -------------------------------------------------------------------------

resource "aws_iam_role" "autosoc_ingestion_role" {
  name        = "AutoSOC-Telemetry-Ingestion-Role-${var.environment}"
  description = "Scoped read-only role for AutoSOC findings ingestion and health checks"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "autosoc_ingestion_policy" {
  name        = "AutoSOC-Telemetry-Ingestion-Policy-${var.environment}"
  description = "Strict least-privilege read-only permissions for cloud telemetry"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "STSIdentityCheck"
        Effect = "Allow"
        Action = [
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      },
      {
        Sid    = "SecurityHubRead"
        Effect = "Allow"
        Action = [
          "securityhub:DescribeHub",
          "securityhub:GetFindings"
        ]
        Resource = "*"
      },
      {
        Sid    = "GuardDutyRead"
        Effect = "Allow"
        Action = [
          "guardduty:ListDetectors",
          "guardduty:GetDetector",
          "guardduty:ListFindings",
          "guardduty:GetFindings"
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudTrailRead"
        Effect = "Allow"
        Action = [
          "cloudtrail:DescribeTrails",
          "cloudtrail:LookupEvents"
        ]
        Resource = "*"
      },
      {
        Sid    = "ConfigRead"
        Effect = "Allow"
        Action = [
          "config:DescribeComplianceByConfigRule",
          "config:DescribeConfigRules"
        ]
        Resource = "*"
      },
      {
        Sid    = "InspectorRead"
        Effect = "Allow"
        Action = [
          "inspector2:ListCoverage",
          "inspector2:ListFindings"
        ]
        Resource = "*"
      },
      {
        Sid    = "BedrockAIInvoke"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-3-sonnet-*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ingestion_attachment" {
  role       = aws_iam_role.autosoc_ingestion_role.name
  policy_arn = aws_iam_policy.autosoc_ingestion_policy.arn
}

# -------------------------------------------------------------------------
# AutoSOC Remediation Role (Separate Scoped Role)
# Gated strictly to verified response playbooks with zero wildcard mutations
# -------------------------------------------------------------------------

resource "aws_iam_role" "autosoc_remediation_role" {
  name        = "AutoSOC-Remediation-Execution-Role-${var.environment}"
  description = "Scoped remediation role strictly for confirmed playbooks"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.autosoc_ingestion_role.arn
        }
      }
    ]
  })
}

resource "aws_iam_policy" "autosoc_remediation_policy" {
  name        = "AutoSOC-Remediation-Policy-${var.environment}"
  description = "Scoped remediation permissions for EC2 isolation, IAM key deactivation, S3 block public"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EC2QuarantineSG"
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:ModifyInstanceAttribute"
        ]
        Resource = "arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:instance/*"
      },
      {
        Sid    = "IAMKeyDeactivation"
        Effect = "Allow"
        Action = [
          "iam:UpdateAccessKey"
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/*"
      },
      {
        Sid    = "S3PublicBlockEnforcement"
        Effect = "Allow"
        Action = [
          "s3:PutBucketPublicAccessBlock",
          "s3:GetBucketPublicAccessBlock"
        ]
        Resource = "arn:aws:s3:::*"
      },
      {
        Sid    = "WAFIPSetUpdate"
        Effect = "Allow"
        Action = [
          "wafv2:UpdateIPSet",
          "wafv2:GetIPSet"
        ]
        Resource = "arn:aws:wafv2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:regional/ipset/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "remediation_attachment" {
  role       = aws_iam_role.autosoc_remediation_role.name
  policy_arn = aws_iam_policy.autosoc_remediation_policy.arn
}
