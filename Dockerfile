FROM busybox:1.34.1

# Some comment
COPY script.sh script.sh
CMD ["script.sh"]
ENTRYPOINT ["sh"]
