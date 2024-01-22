FROM busybox:1.34.1

COPY ./script.sh /
RUN chmod +x /script.sh
ENTRYPOINT ["/script.sh"]

