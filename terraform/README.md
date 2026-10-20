# AutoSOC Infrastructure-as-Code (Terraform) Starter

This Terraform module provisions the foundational cloud security resources for AutoSOC under strict least-privilege principles.

## Cost Safety & Design Principles
- **No Costly Resources by Default:** `enable_security_hub` and `enable_guardduty` default to `false` to prevent accidental billing when spinning up sandbox environments.
- **On-Demand Serverless Storage:** DynamoDB uses `PAY_PER_REQUEST` billing ($0.00 base hourly fee).
- **Hardened S3 Bucket:** All 4 S3 Block Public Access controls are permanently enabled, encrypted via AWS KMS Customer Managed Keys, and equipped with a 90-day Glacier lifecycle policy.
- **Separated IAM Roles:** Read-only telemetry ingestion is strictly decoupled from remediation execution.

## Prerequisites
1. [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) >= 1.5.0
2. AWS CLI configured with active credentials (`aws sts get-caller-identity`)

## Usage

### 1. Initialize Working Directory
```bash
cd terraform
terraform init
```

### 2. Review Dry-Run Execution Plan
```bash
# Preview proposed resources without making mutations:
terraform plan -var="aws_region=ap-south-1" -var="environment=dev"
```

### 3. Provision Infrastructure
```bash
terraform apply -var="aws_region=ap-south-1" -var="environment=dev"
```

### 4. Enable Paid Services (Optional)
If you wish to provision Security Hub and GuardDuty directly via Terraform:
```bash
terraform apply \
  -var="aws_region=ap-south-1" \
  -var="enable_security_hub=true" \
  -var="enable_guardduty=true"
```

### 5. Clean Destruction & Teardown
To remove all provisioned infrastructure and prevent ongoing charges:
```bash
# Empty S3 versioned bucket objects first if any exist
terraform destroy -var="aws_region=ap-south-1" -var="environment=dev"
```
