FROM golang:1.16-alpine

# Set destination for COPY
WORKDIR /app

ARG MZO_FILE_ENV_VARIABLE
RUN echo "$MZO_FILE_ENV_VARIABLE"
ENV MZO_FILE_ENV_VARIABLE $MZO_FILE_ENV_VARIABLE

# Download Go modules
COPY go.mod .
COPY go.sum .
COPY ${MZO_FILE_ENV_VARIABLE} ./file.yaml
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/engine/reference/builder/#copy
COPY *.go ./

# Build
RUN go build -o /docker-gs-ping

# This is for documentation purposes only.
# To actually open the port, runtime parameters
# must be supplied to the docker command.
EXPOSE 8080

# (Optional) environment variable that our dockerised
# application can make use of. The value of environment
# variables can also be set via parameters supplied
# to the docker command on the command line.
#ENV HTTP_PORT=8081

# Run
CMD [ "/docker-gs-ping" ]
