# -------------------------------------------------------------------------
# Amazon DynamoDB Table for AutoSOC Incidents & Response State
# Uses PAY_PER_REQUEST (On-Demand) to avoid unnecessary baseline hourly fees
# -------------------------------------------------------------------------

resource "aws_dynamodb_table" "incidents_table" {
  name         = "${var.dynamodb_table_name}_${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "createdAt"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.autosoc_key.arn
  }
}
