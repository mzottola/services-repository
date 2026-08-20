FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o pg-client .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/pg-client /pg-client

ENTRYPOINT ["/pg-client"]
