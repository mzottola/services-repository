#!/bin/bash

echo 'Pushing variables...'

sleep 60
echo '{ "output_secret_3": { "sensitive": true, "value": "updatedvalue4" }, "output_var_3": { "sensitive": false, "value": "updatedvar2" } }' > /qovery-output/qovery-output.json
echo 'done'

