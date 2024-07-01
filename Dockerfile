FROM busybox:1.34.1

COPY script.sh script.sh
CMD ["script.sh"]
ENTRYPOINT ["sh"]
