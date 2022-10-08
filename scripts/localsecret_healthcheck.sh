#!/bin/bash
max_retries=120
attempt=1
while [ "$attempt" -le "$max_retries" ]
do
    echo "attempt: $attempt"; attempt=$((attempt+1));
    bash -c 'curl -sfm1 http://localhost:26657/status && curl -s http://localhost:26657/status | jq -e "(.result.sync_info.latest_block_height | tonumber) > 0"'
    if [ $? -eq 0 ]; then break; fi
    sleep 1
done

