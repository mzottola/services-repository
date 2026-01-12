# Use Ubuntu 22.04 as base image (stable and widely used)
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Update system packages and install required dependencies
RUN apt-get update && \
    apt-get install -y \
    unzip \
    curl \
    less \
    groff \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Verify AWS CLI installation
RUN aws --version

# Set working directory
WORKDIR /root

# Keep container running for testing purposes
CMD ["tail", "-f", "/dev/null"]
