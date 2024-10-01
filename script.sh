#!/bin/bash

echo 'Pushing variables...'
sleep 5
echo '{ "output_secret_1": { "sensitive": true, "value": "updatedvalue" }, "output_var_2": { "sensitive": false, "value": "myvalue" } }' > /qovery-output/qovery-output.json
echo 'done'

