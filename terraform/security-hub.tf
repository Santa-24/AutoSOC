# -------------------------------------------------------------------------
# AWS Security Hub (Optional Activation)
# Gated by var.enable_security_hub to prevent automatic billing
# -------------------------------------------------------------------------

resource "aws_securityhub_account" "main" {
  count = var.enable_security_hub ? 1 : 0

  enable_default_standards = true
  control_finding_generator = "SECURITY_CONTROL"
  auto_enable_controls     = true
}

resource "aws_securityhub_standards_subscription" "cis_aws_foundations" {
  count         = var.enable_security_hub ? 1 : 0
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${var.aws_region}::standards/cis-aws-foundations-benchmark/v/3.0.0"
}
