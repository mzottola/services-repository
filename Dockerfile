FROM golang:1.16-alpine

ARG BUILD_ENV_VAR
RUN test -n "$BUILD_ENV_VAR" || (echo "ERROR: BUILD_ENV_VAR build arg is not set" && exit 1)
ENV BUILD_ENV_VAR=$BUILD_ENV_VAR

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/engine/reference/builder/#copy
COPY *.go ./

# Build
RUN go build -o /docker-gs-ping

RUN apk update
RUN apk upgrade

RUN apk add curl

# This is for documentation purposes only.
# To actually open the port, runtime parameters
# must be supplied to the docker command.
EXPOSE 8080
EXPOSE 3000

# (Optional) environment variable that our dockerised
# application can make use of. The value of environment
# variables can also be set via parameters supplied
# to the docker command on the command line.
#ENV HTTP_PORT=8081

# Run
CMD [ "/docker-gs-ping" ]
