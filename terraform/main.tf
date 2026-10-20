terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "AutoSOC"
      ManagedBy   = "Terraform"
      Environment = var.environment
      SecurityTier = "SecOps-Foundation"
    }
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}
