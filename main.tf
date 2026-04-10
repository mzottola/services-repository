provider "aws" {
  region = "eu-west-3"
}

resource "aws_s3_bucket" "basic_bucket" {
  bucket        = "qovery-bucket-test-unique-mzo"
  force_destroy = true
}

output "bucket_name" {
  value = aws_s3_bucket.basic_bucket.bucket
}
