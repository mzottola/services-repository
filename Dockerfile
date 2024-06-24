FROM busybox:1.34.1

CMD echo "Hello job failing";sleep 10; echo "End job"; return 251;
