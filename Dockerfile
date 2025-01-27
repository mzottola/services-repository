FROM debian:bookworm

RUN apt-get update && \
	apt-get -y upgrade && \
	apt -y install curl && \
	apt-get clean

COPY script.sh script.sh

CMD ["./script.sh"]

