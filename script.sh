#!/bin/bash

echo 'Pushing variables...'
sleep 900
echo '{ "output_secret_1": { "sensitive": true, "value": "updatedvalue" }, "output_var_2": { "sensitive": false, "value": "updatedvar" } }' > /qovery-output/qovery-output.json
echo 'done'

