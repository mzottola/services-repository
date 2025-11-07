#!/bin/bash

echo 'Pushing variables...'

sleep 1
echo '{ "output_secret_2": { "sensitive": true, "value": "updatedvalue2" }, "output_var_3": { "sensitive": false, "value": "updatedvar2" } }' > /qovery-output/qovery-output.json
echo 'done'

