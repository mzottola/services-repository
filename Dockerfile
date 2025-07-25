FROM busybox:1.34.1

CMD echo "Hello job new pr 3";sleep 5; echo "End job";
RUN adduser -D -u 1000 appuser
USER 1000
