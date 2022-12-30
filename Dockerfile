FROM busybox:1.34.1

ARG MZO_VAR_JOB_1
ENV MZO_VAR_JOB_1 $MZO_VAR_JOB_1
RUN echo "MZO_VAR=$MZO_VAR_JOB_1"

COPY ./script.sh /
RUN chmod +x /script.sh
ENTRYPOINT ["/script.sh"]
CMD ["toto"]

