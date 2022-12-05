#!/bin/bash

#
# Adapted from: https://github.com/scrtlabs/snip20-reference-impl/blob/master/tests/integration.sh
# This script is used by Gitpod or other compatible remote development environment (see .gitpod.yml)
# to interact with the running LocalSecret instance to deploy a secret contract.
#

set -e
set -o pipefail # If anything in a pipeline fails, the pipe's exit status is a failure
#set -x # Print all commands for debugging

declare -a KEY=(a b c d)

declare -A FROM=(
    [a]='-y --from a'
    [b]='-y --from b'
    [c]='-y --from c'
    [d]='-y --from d'
)

# This means we don't need to configure the cli since it uses the preconfigured cli in the docker.
# We define this as a function rather than as an alias because it has more flexible expansion behavior.
# In particular, it's not possible to dynamically expand aliases, but `tx_of` dynamically executes whatever
# we specify in its arguments.
function secretcli() {
    docker exec localsecret /usr/bin/secretd "$@"
}

# Just like `echo`, but prints to stderr
function log() {
    echo -e "$@" >&2
}

# suppress all output to stdout for the command described in the arguments
function quiet() {
    "$@" >/dev/null
}

# suppress all output to stdout and stderr for the command described in the arguments
function silent() {
    "$@" >/dev/null 2>&1
}

# Pad the string in the first argument to 256 bytes, using spaces
function pad_space() {
    printf '%-256s' "$1"
}

declare -A ADDRESS=(
    [a]="$(secretcli keys show --address a)"
    [b]="$(secretcli keys show --address b)"
    [c]="$(secretcli keys show --address c)"
    [d]="$(secretcli keys show --address d)"
)

declare -A VK=([a]='' [b]='' [c]='' [d]='')

# Generate a label for a contract with a given code id
# This just adds "contract_" before the code id.
function label_by_id() {
    local id="$1"
    echo "contract_$id"
}

# Keep polling the blockchain until the tx completes.
# The first argument is the tx hash.
# The second argument is a message that will be logged after every failed attempt.
# The tx information will be returned.
function wait_for_tx() {
    local tx_hash="$1"

    local result

    log "waiting on tx: $tx_hash"
    # secretcli will only print to stdout when it succeeds
    until result="$(secretcli query tx "$tx_hash" 2>/dev/null)"; do
        sleep 1
    done

    # log out-of-gas events
    if quiet jq -e '.raw_log | startswith("execute contract failed: Out of gas: ") or startswith("out of gas:")' <<<"$result"; then
        log "$(jq -r '.raw_log' <<<"$result")"
    fi

    echo "$result"
}

# This is a wrapper around `wait_for_tx` that also decrypts the response,
# and returns a nonzero status code if the tx failed
function wait_for_compute_tx() {
    local tx_hash="$1"
    local message="$2"
    local return_value=0
    local result
    local decrypted

    result="$(wait_for_tx "$tx_hash" "$message")"
    # log "$result"
    if quiet jq -e '.logs == null' <<<"$result"; then
        return_value=1
    fi
    decrypted="$(secretcli query compute tx "$tx_hash")" || return
    log "$decrypted"
    echo "$decrypted"

    return "$return_value"
}

# If the tx failed, return a nonzero status code.
# The decrypted error or message will be echoed
function check_tx() {
    local tx_hash="$1"
    local result
    local return_value=0

    result="$(secretcli query tx "$tx_hash")"
    if quiet jq -e '.logs == null' <<<"$result"; then
        return_value=1
    fi
    decrypted="$(secretcli query compute tx "$tx_hash")" || return
    log "$decrypted"
    echo "$decrypted"

    return "$return_value"
}

# Extract the tx_hash from the output of the command
function tx_of() {
    "$@" | jq -r '.txhash'
}

# Extract the output_data_as_string from the output of the command
function data_of() {
    "$@" | jq -r '.output_data_as_string'
}

function get_generic_err() {
    jq -r '.output_error.generic_err.msg' <<<"$1"
}

# Send a compute transaction and return the tx hash.
# All arguments to this function are passed directly to `secretcli tx compute execute`.
function compute_execute() {
    tx_of secretcli tx compute execute "$@"
}

# Send a query to the contract.
# All arguments to this function are passed directly to `secretcli query compute query`.
function compute_query() {
    secretcli query compute query "$@"
}

function upload_contract() {
    set -e
    local directory="$1"
    local tx_hash
    local code_id

    tx_hash="$(tx_of secretcli tx compute store "code/$directory/contract.wasm.gz" ${FROM[a]} --gas 10000000)"
    code_id="$(
        wait_for_tx "$tx_hash" 'waiting for contract upload' |
            jq -r '.logs[0].events[0].attributes[] | select(.key == "code_id") | .value'
    )"

    log "uploaded contract"

    echo "$code_id"
}

function query_contract_hash() {
    set -e
    local code_id="$1"

    code_hash="$(secretcli query compute contract-hash-by-id "$code_id")" || return
    log "got contract hash"
    echo "$code_hash"
}
    

function instantiate() {
    set -e
    local code_id="$1"
    local init_msg="$2"

    log 'sending init message: \c'
    log "${init_msg@Q}"

    local tx_hash
    tx_hash="$(tx_of secretcli tx compute instantiate "$code_id" "$init_msg" --label "$(label_by_id "$code_id")" ${FROM[a]} --gas 10000000)"
    wait_for_tx "$tx_hash" 'waiting for init to complete'
}

# This function uploads and instantiates a contract, and returns the new contract's address
function create_contract() {
    set -e
    local init_msg="$1"
    local code_id="$2"

    local init_result
    init_result="$(instantiate "$code_id" "$init_msg")"

    if quiet jq -e '.logs == null' <<<"$init_result"; then
        log "$(secretcli query compute tx "$(jq -r '.txhash' <<<"$init_result")")"
        return 1
    fi

    jq -r '.logs[0].events[0].attributes[] | select(.key == "contract_address") | .value' <<<"$init_result"
}

function unix_time_of_tx() {
    set -e
    local tx="$1"

    date -d "$(jq -r '.timestamp' <<<"$tx")" '+%s'
}

SECRET_BOX_CODE_ID=''
SECRET_BOX_ADDRESS=''
SECRET_BOX_CODE_HASH=''

if [ "$LOCALSECRET_GRPC" == "" ]
then
    LOCALSECRET_GRPC='http://localhost:9091'
fi

function main() {
    log '              <####> Create Secret Box contract <####>'
    log "secretcli version in the docker image is: $(secretcli version)\n"

    localsecret_grpc=$LOCALSECRET_GRPC
    log -e "LocalSecret gRPC: $localsecret_grpc\n"

    local init_msg
    init_msg='{"count": 16876}'
    code_id="$(upload_contract '.')"
    contract_hash="$(query_contract_hash "$code_id")"
    contract_addr="$(create_contract "$init_msg" "$code_id")"

    log '\nSecret Box created successfully!\n'

    log "secret code id: $code_id"
    log "secret contract address: $contract_addr"
    log -e "secret contract code hash: $contract_hash\n"

    log 'Storing environment variables:'
    echo -e "SECRET_BOX_CODE=$code_id\nSECRET_BOX_ADDRESS=$contract_addr\nSECRET_BOX_HASH=$contract_hash\nLOCALSECRET_GRPC=$localsecret_grpc" > .env
    echo -e "VITE_SECRET_BOX_CODE=$code_id\nVITE_SECRET_BOX_ADDRESS=$contract_addr\nVITE_SECRET_BOX_HASH=$contract_hash\nVITE_LOCALSECRET_GRPC=$localsecret_grpc" > app/.env
    echo -e "SECRET_BOX_CODE=$code_id\nSECRET_BOX_ADDRESS=$contract_addr\nSECRET_BOX_HASH=$contract_hash\nLOCALSECRET_GRPC=$localsecret_grpc" > tests/.env
    log "\n==="
    log "=== Use 'source .env' to set the SECRET BOX environment variables in your local bash shell"
    log "===\n"

    log 'Returning environment variables for Gitpod workspace'
    # If everything else worked, return successful status
    echo "SECRET_BOX_CODE=$code_id SECRET_BOX_ADDRESS=$contract_addr SECRET_BOX_HASH=$contract_hash LOCALSECRET_GRPC=$localsecret_grpc"
    return 0
}

main "$@"
